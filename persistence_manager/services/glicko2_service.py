import math
from ..models import Player
from django.db import transaction


class Rating(object):
    def __init__(self, name, rating=Player.DEFAULT_RATING, rd=Player.DEFAULT_RD, sigma=Player.SIGMA):
        self.name = name
        self.rating = rating
        self.rd = rd
        self.sigma = sigma

    def __repr__(self):
        c = type(self)
        args = (c.__module__, c.__name__, self.rating, self.rd, self.sigma)
        return '%s.%s(mu=%.3f, phi=%.3f, sigma=%.3f)' % args


class Glicko2(object):
    def __init__(self, rating=Player.DEFAULT_RATING, rd=Player.DEFAULT_RD, sigma=Player.SIGMA, tau=Player.TAU, epsilon=Player.EPSILON):
        self.rating = rating
        self.rd = rd
        self.sigma = sigma
        self.tau = tau
        self.epsilon = epsilon
        
    def create_from_db(self, name) -> Rating:
        player = Player.objects.get(name=name)
        name = player.name
        rating = player.rating
        rd = player.rd
        sigma = player.sigma
        
        return self.create_rating(name=name, rating=rating, rd=rd, sigma=sigma)
    
    def bulk_create_from_db(self, *args) -> tuple[Rating]:
        ratings = []
        for name in args:
            player = Player.objects.get(name=name)
            name = player.name
            rating = player.rating
            rd = player.rd
            sigma = player.sigma
            ratings.append(self.create_rating(name=name, rating=rating, rd=rd, sigma=sigma))
        
        return tuple(ratings)
    
    def dump_to_database(self, rating: Rating) -> None:
        p = Player.objects.get(name=rating.name)
        p.rating = rating.rating
        p.rd = rating.rd
        p.sigma = rating.sigma
        p.save()
        
    def bulk_dump_to_database(self, ratings: list[Rating] | tuple[Rating]) -> None:
        with transaction.atomic():
            for rating in ratings:
                p = Player.objects.get(name=rating.name)
                p.rating = rating.rating
                p.rd = rating.rd
                p.sigma = rating.sigma
                p.save()

    def create_rating(self, name: str, rating=None, rd=None, sigma=None) -> Rating:
        if rating is None:
            rating = self.rating
        if rd is None:
            rd = self.rd
        if sigma is None:
            sigma = self.sigma
        return Rating(name=name, rating=rating, rd=rd, sigma=sigma)

    def scale_down(self, rating: Rating, ratio: float=173.7178) -> Rating:
        r = (rating.rating - self.rating) / ratio
        rd = rating.rd / ratio
        return self.create_rating(rating.name, r, rd, rating.sigma)

    def scale_up(self, rating, ratio=173.7178) -> Rating:
        r = rating.rating * ratio + self.rating
        rd = rating.rd * ratio
        return self.create_rating(rating.name, r, rd, rating.sigma)

    def reduce_impact(self, rating):
        """The original form is `g(RD)`. This function reduces the impact of
        games as a function of an opponent's RD.
        """
        return 1. / math.sqrt(1 + (3 * rating.rd ** 2) / (math.pi ** 2))

    def expect_score(self, rating: Rating, other_rating: Rating, impact):
        return 1. / (1 + math.exp(-impact * (rating.rating - other_rating.rating)))

    def determine_sigma(self, rating: Rating, difference, variance) -> float:
        """Determines new sigma."""
        rd = rating.rd
        difference_squared = difference ** 2
        # 1. Let a = ln(s^2), and define f(x)
        alpha = math.log(rating.sigma ** 2)

        def f(x) -> float:
            """This function is twice the conditional log-posterior density of
            rd, and is the optimality criterion.
            """
            tmp = rd ** 2 + variance + math.exp(x)
            a = math.exp(x) * (difference_squared - tmp) / (2 * tmp ** 2)
            b = (x - alpha) / (self.tau ** 2)
            return a - b

        # 2. Set the initial values of the iterative algorithm.
        a = alpha
        if difference_squared > rd ** 2 + variance:
            b = math.log(difference_squared - rd ** 2 - variance)
        else:
            k = 1
            while f(alpha - k * math.sqrt(self.tau ** 2)) < 0:
                k += 1
            b = alpha - k * math.sqrt(self.tau ** 2)
        # 3. Let fA = f(A) and f(B) = f(B)
        f_a, f_b = f(a), f(b)
        # 4. While |B-A| > e, carry out the following steps.
        # (a) Let C = A + (A - B)fA / (fB-fA), and let fC = f(C).
        # (b) If fCfB < 0, then set A <- B and fA <- fB; otherwise, just set
        #     fA <- fA/2.
        # (c) Set B <- C and fB <- fC.
        # (d) Stop if |B-A| <= e. Repeat the above three steps otherwise.
        while abs(b - a) > self.epsilon:
            c = a + (a - b) * f_a / (f_b - f_a)
            f_c = f(c)
            if f_c * f_b < 0:
                a, f_a = b, f_b
            else:
                f_a /= 2
            b, f_b = c, f_c
        # 5. Once |B-A| <= e, set s' <- e^(A/2)
        return math.exp(1) ** (a / 2)

    def rate(self, rating: Rating, series) -> Rating:
        # Step 2. For each player, convert the rating and RD's onto the
        #         Glicko-2 scale.
        rating = self.scale_down(rating)
        # Step 3. Compute the quantity v. This is the estimated variance of the
        #         team's/player's rating based only on game outcomes.
        # Step 4. Compute the quantity difference, the estimated improvement in
        #         rating by comparing the pre-period rating to the performance
        #         rating based only on game outcomes.
        variance_inv = 0
        difference = 0
        if not series:
            # If the team didn't play in the series, do only Step 6
            rd_star = math.sqrt(rating.rd ** 2 + rating.sigma ** 2)
            return self.scale_up(self.create_rating(rating.rating, rd_star, rating.sigma)) # type: ignore
        for actual_score, other_rating in series:
            other_rating = self.scale_down(other_rating)
            impact = self.reduce_impact(other_rating)
            expected_score = self.expect_score(rating, other_rating, impact)
            variance_inv += impact ** 2 * expected_score * (1 - expected_score)
            difference += impact * (actual_score - expected_score)
        difference /= variance_inv
        variance = 1. / variance_inv
        # Step 5. Determine the new value, Sigma', ot the sigma. This
        #         computation requires iteration.
        sigma = self.determine_sigma(rating, difference, variance)
        # Step 6. Update the rating deviation to the new pre-rating period
        #         value, Phi*.
        rd_star = math.sqrt(rating.rd ** 2 + sigma ** 2)
        # Step 7. Update the rating and RD to the new values, Mu' and Phi'.
        rd = 1. / math.sqrt(1 / rd_star ** 2 + 1 / variance)
        r = rating.rating + rd ** 2 * (difference / variance)
        # Step 8. Convert ratings and RD's back to original scale.
        return self.scale_up(self.create_rating(rating.name, r, rd, sigma))

    def rate_1vs1(self, name_p1, name_p2, drawn=False):
        r1, r2 = self.bulk_create_from_db(name_p1, name_p2) # type: ignore
        self.bulk_dump_to_database((
            self.rate(r1, [(Player.DRAW if drawn else Player.WIN, r2)]),
            self.rate(r2, [(Player.DRAW if drawn else Player.LOSS, r1)])
        )) # type: ignore
        
    def rate_1vs1_bo3(self, name_p1: str, name_p2: str, games: list, drawn: bool = False):
        """A function that update the ratings of two players that play a 1v1 bo3 match.

        Args:
            name_p1 (str): the name of the winner player
            name_p2 (str): the name of the looser player
            games (list): a list with three values, one for each game. Te possible values are 1 (win for the winner), 0 (drawn game), -1 (loos for the winner) and None (not played).
            drawn (bool): if True, the final ratings will remains at the same values as there was
        """
        if drawn:
            return
        
        for result in games:
            r1, r2 = self.bulk_create_from_db(name_p1, name_p2) # type: ignore
            if result == 1:
                self.bulk_dump_to_database((
                    self.rate(r1, [(Player.WIN, r2)]),
                    self.rate(r2, [(Player.LOSS, r1)])
                )) # type: ignore
            
            elif result == 0:
                self.bulk_dump_to_database((
                    self.rate(r1, [(Player.DRAW, r2)]),
                    self.rate(r2, [(Player.DRAW, r1)])
                )) # type: ignore
            
            elif result == -1:
                self.bulk_dump_to_database((
                    self.rate(r1, [(Player.LOSS, r2)]),
                    self.rate(r2, [(Player.WIN, r1)])
                )) # type: ignore

    def quality_1vs1(self, rating1, rating2):
        expected_score1 = self.expect_score(rating1, rating2, self.reduce_impact(rating1))
        expected_score2 = self.expect_score(rating2, rating1, self.reduce_impact(rating2))
        expected_score = (expected_score1 + expected_score2) / 2
        return 2 * (0.5 - abs(0.5 - expected_score))
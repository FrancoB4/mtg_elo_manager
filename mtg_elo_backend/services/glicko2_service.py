import math
from datetime import date as da

from apps.leagues.models import League, LeaguePlayer
from apps.tournaments.models import Match, Tournament
from .helper import Rating, get_games_won_per_player, calculate_swiss_rounds, sum_bo3_results
from apps.players.models import Player
from django.db import transaction


# class Rating(object):
#     def __init__(self, name, rating=Player.DEFAULT_RATING, rd=Player.DEFAULT_RD, sigma=Player.SIGMA):
#         self.name = name
#         self.rating = rating
#         self.rd = rd
#         self.sigma = sigma

#     def __repr__(self):
#         c = type(self)
#         args = (c.__module__, c.__name__, self.rating, self.rd, self.sigma)
#         return '%s.%s(mu=%.3f, phi=%.3f, sigma=%.3f)' % args


class Glicko2Service(object):
    def __init__(self, rating=Rating.DEFAULT_RATING, rd=Rating.DEFAULT_RD, sigma=Rating.SIGMA, tau=Rating.TAU, epsilon=Rating.EPSILON):
        self.rating = rating
        self.rd = rd
        self.sigma = sigma
        self.tau = tau
        self.epsilon = epsilon
        
    def create_from_db(self, name: str) -> Rating:
        player = Player.objects.get(name=name)
        name = player.name
        rating = player.rating
        rd = player.rd
        sigma = player.sigma
        
        return self.create_rating(name=name, rating=rating, rd=rd, sigma=sigma)
    
    def bulk_create_from_db(self, *args) -> tuple[Rating, Rating]:
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
                p.update_stats(rating)

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
            return self.scale_up(self.create_rating(rating.name, rating.rating, rd_star, rating.sigma)) # type: ignore
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

    def quality_1vs1(self, rating1, rating2):
        expected_score1 = self.expect_score(rating1, rating2, self.reduce_impact(rating1))
        expected_score2 = self.expect_score(rating2, rating1, self.reduce_impact(rating2))
        expected_score = (expected_score1 + expected_score2) / 2
        return 2 * (0.5 - abs(0.5 - expected_score))

    def rate_1vs1(self, p1: Player | None, p2: Player | None, p1_league: LeaguePlayer | None, p2_league: LeaguePlayer | None, league: League | None, games: list[int | None], tournament: Tournament, round_number: int | None = None) -> Match | None:
        """_summary_

        Args:
            name_p1 (str): The name of player 1.
            name_p2 (str): The name of player 2.
            games (list[int | None]): A list of game results where 1 means player 1 won, -1 means player 2 won, 0 means a draw and None means a not played game.
            tournament (int): The tournament ID.
        """
        with transaction.atomic():
            name_p1 = p1.name if p1 else 'Bye'
            name_p2 = p2.name if p2 else 'Bye'
            
            match = tournament.create_match(
                player1=p1,
                player2=p2,
                games=games,
                round_number=round_number
            )
            
            p1_tournament = tournament.get_or_create_tournament_rating(player=p1)[0] if p1 else None
            p2_tournament = tournament.get_or_create_tournament_rating(player=p2)[0] if p2 else None
            
            if not p1 or not p2 or (league and not p1_league) or (league and not p2_league) or not p1_tournament or not p2_tournament: # type: ignore
                return
            
            result = sum_bo3_results(games)
            
            if league and p1_league and p2_league: # type: ignore
                p1_league.update_matches_played(result)
                p2_league.update_matches_played(-result)

            p1_tournament.update_matches_played(result)
            p2_tournament.update_matches_played(-result)

            p1.update_matches_played(result)
            p2.update_matches_played(-result)

            r1 = self.create_rating(name_p1, p1.rating, p1.rd, p1.sigma)
            r2 = self.create_rating(name_p2, p2.rating, p2.rd, p2.sigma)
            
            # Player historic rating
            r1_aux = self.create_rating(name_p1, p1.rating, p1.rd, p1.sigma)
            r2_aux = self.create_rating(name_p2, p2.rating, p2.rd, p2.sigma)
            
            # League ratings
            if league and p1_league and p2_league: # type: ignore
                r1_league_aux = self.create_rating(
                    name_p1, p1_league.rating, p1_league.rd, p1_league.sigma
                )
                r2_league_aux = self.create_rating(
                    name_p2, p2_league.rating, p2_league.rd, p2_league.sigma
                )
                
                r1_league = self.create_rating(
                    name_p1, p1_league.rating, p1_league.rd, p1_league.sigma
                )
                r2_league = self.create_rating(
                    name_p2, p2_league.rating, p2_league.rd, p2_league.sigma
                )
            
            
            # Tournament ratings
            r1_tournament_aux = self.create_rating(
                name_p1, p1_tournament.rating, p1_tournament.rd, p1_tournament.sigma
            )
            r2_tournament_aux = self.create_rating(
                name_p2, p2_tournament.rating, p2_tournament.rd, p2_tournament.sigma
            )
            
            r1_tournament = self.create_rating(
                name_p1, p1_tournament.rating, p1_tournament.rd, p1_tournament.sigma
            )
            r2_tournament = self.create_rating(
                name_p2, p2_tournament.rating, p2_tournament.rd, p2_tournament.sigma
            )
            
            p1_series = {'historic': [], 'league': [], 'tournament': []}
            p2_series = {'historic': [], 'league': [], 'tournament': []}
            for result in games:
                if result == 1:
                    p1_series['historic'].append((Rating.WIN, r2_aux))
                    p2_series['historic'].append((Rating.LOSS, r1_aux))
                    if league and p1_league and p2_league and r1_league_aux and r2_league_aux: # type: ignore
                        p1_series['league'].append((Rating.WIN, r2_league_aux))
                        p2_series['league'].append((Rating.LOSS, r1_league_aux))
                    p1_series['tournament'].append((Rating.WIN, r2_tournament_aux))
                    p2_series['tournament'].append((Rating.LOSS, r1_tournament_aux))
                
                elif result == 0:
                    p1_series['historic'].append((Rating.DRAW, r2_aux))
                    p2_series['historic'].append((Rating.DRAW, r1_aux))
                    if league and p1_league and p2_league and r1_league_aux and r2_league_aux: # type: ignore
                        p1_series['league'].append((Rating.DRAW, r2_league_aux))
                        p2_series['league'].append((Rating.DRAW, r1_league_aux))
                    p1_series['tournament'].append((Rating.DRAW, r2_tournament_aux))
                    p2_series['tournament'].append((Rating.DRAW, r1_tournament_aux))
                
                elif result == -1:
                    p1_series['historic'].append((Rating.LOSS, r2_aux))
                    p2_series['historic'].append((Rating.WIN, r1_aux))
                    if league and p1_league and p2_league and r1_league_aux and r2_league_aux: # type: ignore
                        p1_series['league'].append((Rating.LOSS, r2_league_aux))
                        p2_series['league'].append((Rating.WIN, r1_league_aux))
                    p1_series['tournament'].append((Rating.LOSS, r2_tournament_aux))
                    p2_series['tournament'].append((Rating.WIN, r1_tournament_aux))

            p1.update_stats(self.rate(r1, p1_series['historic']))
            p2.update_stats(self.rate(r2, p2_series['historic']))

            if league and p1_league and p2_league and r1_league and r2_league: # type: ignore
                p1_league.update_stats(self.rate(r1_league, p1_series['league']))
                p2_league.update_stats(self.rate(r2_league, p2_series['league']))
            
            p1_tournament.update_stats(self.rate(r1_tournament, p1_series['tournament']))
            p2_tournament.update_stats(self.rate(r2_tournament, p2_series['tournament']))
            
            return match
        
    
    def rate_league_event(self, matches: list[tuple[str, str, list[int|None]]], league: League, tournament: Tournament | None = None, no_diff_on_drawn: bool = False,
                          date: str | None = None) -> None:
        with transaction.atomic():
            q_players = len(set(list(map(lambda x: x[0], matches)) + list(map(lambda x: x[1], matches))))
            # Create a new tournament if necesary
            if tournament is None:
                rounds = calculate_swiss_rounds(q_players)
                
                tournament = Tournament.objects.create(
                    name=da.today().strftime('%d-%m-%Y') if date is None else date,
                    date=da.today() if date is None else date,
                    league=league,
                )
                
                for i in range(rounds):
                    tournament.rounds.create(number=i + 1) # type: ignore
            
            players_start_ratings = {}
            league_players_start_ratings = {}
            players_ids = []
            
            # For each match
            for name_p1, name_p2, games in matches:
                p1 = Player.objects.get_or_create(name=name_p1)[0] if name_p1 != 'Bye' else None
                p2 = Player.objects.get_or_create(name=name_p2)[0] if name_p2 != 'Bye' else None
                
                p1_league = LeaguePlayer.objects.get_or_create(player=p1, league=league)[0] if p1 else None
                p2_league = LeaguePlayer.objects.get_or_create(player=p2, league=league)[0] if p2 else None
                
                self.rate_1vs1(p1, p2, p1_league, p2_league, league, games, tournament)
                
                if p1 is not None and name_p1 not in players_start_ratings.keys():
                    players_start_ratings[name_p1] = p1.rating
                    if p1_league is not None and name_p1 not in league_players_start_ratings.keys():
                        league_players_start_ratings[name_p1] = p1_league.rating
                    players_ids.append(p1.id) # type: ignore
                if p2 is not None and name_p2 not in players_start_ratings.keys():
                    players_start_ratings[name_p2] = p2.rating
                    if p2_league is not None and name_p2 not in league_players_start_ratings.keys():
                        league_players_start_ratings[name_p2] = p2_league.rating
                    players_ids.append(p2.id) # type: ignore
                
            for player in Player.objects.all():
                player.determine_last_tendency(players_start_ratings.get(player.name, player.rating))
                
                if player.id not in players_ids: # type: ignore
                    r = self.create_rating(
                        player.name, player.rating, player.rd, player.sigma,
                    )
                    r = self.rate(r, [])
                    player.update_stats(r)
                    
            for league_player in LeaguePlayer.objects.filter(league=league):
                league_player.determine_last_tendency(league_players_start_ratings.get(league_player.player.name, league_player.rating))
                
                if league_player.player.id not in players_ids: # type: ignore
                    r = self.create_rating(
                        league_player.player.name, league_player.rating, league_player.rd, league_player.sigma,
                    )
                    r = self.rate(r, [])
                    league_player.update_stats(r)
            
            tournament.set_winner()
            tournament.clean_empty_rounds()

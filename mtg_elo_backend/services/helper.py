from django.conf import settings

class Rating(object):
    #: The actual score for win
    WIN = settings.WIN
    #: The actual score for draw
    DRAW = settings.DRAW
    #: The actual score for loss
    LOSS = settings.LOSS

    # Default settings for some values
    DEFAULT_RATING = settings.DEFAULT_RATING
    DEFAULT_RD = settings.DEFAULT_RD
    SIGMA = settings.SIGMA
    TAU = settings.TAU
    EPSILON = settings.EPSILON
    
    def __init__(self, name, rating=settings.DEFAULT_RATING, rd=settings.DEFAULT_RD, sigma=settings.SIGMA):
        self.name = name
        self.rating = rating
        self.rd = rd
        self.sigma = sigma

    def __repr__(self):
        c = type(self)
        args = (c.__module__, c.__name__, self.rating, self.rd, self.sigma)
        return '%s.%s(mu=%.3f, phi=%.3f, sigma=%.3f)' % args
    

def get_games_won_per_player(games: list[int | None]) -> tuple[int, int]:
    """
    Returns the number of games won and lost based on the list of game results.
    Each game result is represented as an integer where:
    - 1 indicates a win for the winner
    - 0 indicates a draw
    - -1 indicates a win for the loser
    """
    p1_wins = sum(1 for game in games if game == 1)
    p2_wins = sum(1 for game in games if game == -1)
    return p1_wins, p2_wins


def sum_bo3_results(games: list) -> int:
        cont = 0
        for game in games:
            if game == 1:
                cont += 1
            elif game == -1:
                cont -= 1
        return cont
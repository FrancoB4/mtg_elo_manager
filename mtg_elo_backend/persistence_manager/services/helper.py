class Rating(object):
    #: The actual score for win
    WIN = 0.9999999999999
    #: The actual score for draw
    DRAW = 0.5
    #: The actual score for loss
    LOSS = 0.000000000001

    # Default settings for some values
    DEFAULT_RATING = 1500
    DEFAULT_RD = 350
    SIGMA = 0.06
    TAU = .5
    EPSILON = 0.000001
    
    def __init__(self, name, rating=DEFAULT_RATING, rd=DEFAULT_RD, sigma=SIGMA):
        self.name = name
        self.rating = rating
        self.rd = rd
        self.sigma = sigma

    def __repr__(self):
        c = type(self)
        args = (c.__module__, c.__name__, self.rating, self.rd, self.sigma)
        return '%s.%s(mu=%.3f, phi=%.3f, sigma=%.3f)' % args
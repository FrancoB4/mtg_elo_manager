from django.db import models


# Create your models here.
class Player(models.Model):
    #: The actual score for win
    WIN = 1.
    #: The actual score for draw
    DRAW = 0.5
    #: The actual score for loss
    LOSS = 0.

    # Default settings for some values
    DEFAULT_RATING = 1500
    DEFAULT_RD = 350
    SIGMA = 0.06
    TAU = .5
    EPSILON = 0.000001
    
    class LastTendency(models.IntegerChoices):
        BIG_UP = 2, '↑'
        UP = 1, '↗'
        NEUTRAL = 0, '→'
        DOWN = -1, '↘'
        BIG_DOWN = -2, '↓'
    
    name = models.CharField('name', max_length=35, null=False, unique=True)
    rating = models.IntegerField(
        'elo', 
        default=DEFAULT_RATING, null=False, 
        help_text='The rating of a player, wich measures the skill level.'
    )
    rd = models.FloatField(
        'RD', 
        default=DEFAULT_RD, null=False, 
        help_text='Rating Deviation: the uncertainty in the rating of a player.'
    )
    sigma = models.FloatField(
        'vol', 
        default=SIGMA, null=False, 
        help_text='The volatility of the player\'s rating, which measures the \
            consistency of the player\'s performance.'
    )
    matches_played = models.IntegerField(
        'matches played',
        default=0, null=False,
        help_text='The number of matches played by the player.'
    )
    matches_won = models.IntegerField(
        'matches won', 
        default=0, null=False, 
        help_text='The number of matches won by the player.'
    )
    matches_drawn = models.IntegerField(
        'matches drawn', 
        default=0, null=False, 
        help_text='The number of matches drawn by the player.'
    )
    matches_lost = models.IntegerField(
        'matches lost', 
        default=0, null=False, 
        help_text='The number of matches lost by the player.'
    )
    last_tendency = models.IntegerField(
        'last tendency',
        choices=LastTendency.choices,
        default=LastTendency.NEUTRAL,
        help_text='The last tendency of the player\'s rating, which indicates \
            the direction of the player\'s performance in recent matches.'
    )
    
    def determine_last_tendency(self, last_rating: int):
        """
        Determine the last tendency of the player's rating based on the matches played.
        This method updates the last_tendency field based on the player's performance.
        """
        rating_relation = self.rating / last_rating if last_rating != 0 else 1.0
        
        new_tendency = self.LastTendency.NEUTRAL
        
        if rating_relation > 1.1:
            new_tendency = self.LastTendency.BIG_UP
        elif rating_relation >= 1.01:
            new_tendency = self.LastTendency.UP
        elif rating_relation >= 0.99:
            new_tendency = self.LastTendency.NEUTRAL
        elif rating_relation > 0.9:
            new_tendency = self.LastTendency.DOWN
        else:
            new_tendency = self.LastTendency.BIG_DOWN
            
        self.last_tendency = new_tendency
        self.save()
        
    
    def update_stats(self, rating, rd, sigma):
        """
        Update the player's statistics with new rating, RD, and sigma values.
        
        :param rating: The new rating of the player.
        :param rd: The new Rating Deviation of the player.
        :param sigma: The new volatility of the player's rating.
        """
        self.rating = rating
        self.rd = rd
        self.sigma = sigma
        
        self.save()
    
    def __str__(self) -> str:
        return f'{self.name:<35}|{self.rating:^6}|{self.get_last_tendency_display():^11}|{round(self.rd, 8):^14}|{self.matches_played:^9}' # type: ignore
    
    class Meta:
        ordering = ['-rating', 'rd']

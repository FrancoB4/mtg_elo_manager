from django.db import models
import math

# Create your models here.
class Player(models.Model):
    #: The actual score for win
    WIN = 1.
    #: The actual score for draw
    DRAW = 0.5
    #: The actual score for loss
    LOSS = 0.


    DEFAULT_RATING = 1500
    DEFAULT_RD = 350
    SIGMA = 0.06
    TAU = 1.0
    EPSILON = 0.000001
    
    name = models.CharField('name', max_length=50, null=False, unique=True)
    rating = models.IntegerField('elo', default=1500, null=False)
    rd = models.FloatField('RD', default=350, null=False)
    sigma = models.FloatField('vol', default=0.06, null=False)

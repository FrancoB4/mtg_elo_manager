from django.db import models, transaction
# from services.glicko2_service import Glicko2Service
from services.helper import Rating
from services.helper import get_games_won_per_player, sum_bo3_results
from ..tournaments.models import Tournament
from ..players.models import Player, BaseRating

from datetime import date as da

# Create your models here.
class League(models.Model):
    name = models.CharField('name', max_length=35, null=False, unique=True)
    description = models.TextField(
        'description', 
        null=True, blank=True, 
        help_text='A brief description of the league.'
    )
    start_date = models.DateField(
        'start date', 
        null=False, auto_now=True,
        help_text='The date when the league starts.'
    )
    end_date = models.DateField(
        'end date', 
        null=True, 
        help_text='The date when the league ends.'
    )    
    
    def __str__(self) -> str:
        return f'{self.name}'
    
    class Meta:
        ordering = ['name']
        
class LeaguePlayer(BaseRating):
    """Model representing a player in a league with their rating and deviation.
    """
    player = models.ForeignKey(
        Player, 
        on_delete=models.CASCADE, 
        related_name='leagues', help_text='The player who is part of the league.'
    )
    league = models.ForeignKey(
        League, 
        on_delete=models.CASCADE, 
        related_name='players', help_text='The league the player is part of.'
    )
    
    def __str__(self) -> str:
        return f'{self.player.name} - {self.league.name}'
    
    class Meta: # type: ignore
        unique_together = ('player', 'league')
        ordering = ['-rating', 'league__name', 'player__name']
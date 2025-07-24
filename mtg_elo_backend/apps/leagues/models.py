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
    
    def _update_matches_played(self, p1: Player, p2: Player, games: list[int|None]) -> None:
        result = sum_bo3_results(games)
        
        p1_league_player = LeaguePlayer.objects.get_or_create(player=p1, league=self)[0]
        p2_league_player = LeaguePlayer.objects.get_or_create(player=p2, league=self)[0]
        
        p1_league_player.matches_played += 1
        p2_league_player.matches_played += 1
        p1.matches_played += 1
        p2.matches_played += 1
        
        if result > 0:
            p1_league_player.matches_won += 1
            p2_league_player.matches_lost += 1
            p1.matches_won += 1
            p2.matches_lost += 1
        elif result < 0:
            p1_league_player.matches_lost += 1
            p2_league_player.matches_won += 1
            p1.matches_lost += 1
            p2.matches_won += 1
        else:
            p1_league_player.matches_drawn += 1
            p2_league_player.matches_drawn += 1
            p1.matches_drawn += 1
            p2.matches_drawn += 1
            
        p1.save()
        p2.save()
        p1_league_player.save()
        p2_league_player.save()         
    
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
        ordering = ['player__name', 'league__name']
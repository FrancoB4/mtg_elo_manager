from django.db import models
from players.models import Player
from players.services.glicko2_service import Glicko2Service, Rating
from players.services.helper import get_games_won_per_player
from tournaments.models import Tournament

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
    
    def rate_league_event(self, matches: list[tuple[str, str, list[int|None]]], no_diff_on_drawn: bool = False,
                          game_by_game_diff: bool = False, date: str | None = None) -> None:
        tournament = Tournament.objects.create(name=da.today().strftime('%d-%m-%Y') if date is None else date, date=da.today() if date is None else date)
        
        tournament.rate_tournament(
            matches, 
            no_diff_on_drawn=no_diff_on_drawn, 
            game_by_game_diff=game_by_game_diff, 
            date=date
        )
        
        players_start_ratings = {}
        
        for name_p1, name_p2, games in matches:
            p1 = Player.objects.get_or_create(name=name_p1)[0] if name_p1 != 'Bye' else None
            p2 = Player.objects.get_or_create(name=name_p2)[0] if name_p2 != 'Bye' else None
            
            if p1 is not None and name_p1 not in players_start_ratings.keys():
                players_start_ratings[name_p1] = p1.rating
            if p2 is not None and name_p2 not in players_start_ratings.keys():
                players_start_ratings[name_p2] = p2.rating
                
        glicko_service = Glicko2Service()
        
        for name_p1, name_p2, games in matches:
            if name_p1 == 'Bye' or name_p2 == 'Bye':
                continue
            
            p1_wins, p2_wins = get_games_won_per_player(games)
            
            if no_diff_on_drawn and p1_wins == p2_wins:
                continue
            
            p1 = Player.objects.get(name=name_p1)
            p2 = Player.objects.get(name=name_p2)
            
            p1.matchs_played += 1
            p2.matchs_played += 1
            if glicko_service.sum_bo3_results(games) > 0:
                p1.matches_won += 1
                p2.matches_lost += 1
            elif glicko_service.sum_bo3_results(games) < 0:
                p1.matches_lost += 1
                p2.matches_won += 1
            else:
                p1.matches_drawn += 1
                p2.matches_drawn += 1
            p1.save()
            p2.save()
            
            if no_diff_on_drawn and glicko_service.sum_bo3_results(games) == 0:
                return
            
            r1_default, r2_default = glicko_service.bulk_create_from_db(name_p1, name_p2)
            
            for result in games:
                r1, r2 = glicko_service.bulk_create_from_db(name_p1, name_p2)
                
                if not game_by_game_diff:
                    r1.rd = r1_default.rd
                    r2.rd = r2_default.rd
                
                if result == 1:
                    glicko_service.bulk_dump_to_database((
                        glicko_service.rate(r1, [(Player.WIN, r2_default)]),
                        glicko_service.rate(r2, [(Player.LOSS, r1_default)])
                    )) # type: ignore
                
                elif result == 0:
                    glicko_service.bulk_dump_to_database((
                        glicko_service.rate(r1, [(Player.DRAW, r2_default)]),
                        glicko_service.rate(r2, [(Player.DRAW, r1_default)])
                    )) # type: ignore
                
                elif result == -1:
                    glicko_service.bulk_dump_to_database((
                        glicko_service.rate(r1, [(Player.LOSS, r2_default)]),
                        glicko_service.rate(r2, [(Player.WIN, r1_default)])
                    )) # type: ignore
                    
        for player in Player.objects.all():
            player.determine_last_tendency(players_start_ratings.get(player.name, player.rating))
            
    
    def __str__(self) -> str:
        return f'{self.name}'
    
    class Meta:
        ordering = ['name']
        
class LeaguePlayer(models.Model):
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
    
    class Meta:
        unique_together = ('player', 'league')
        ordering = ['player__name', 'league__name']
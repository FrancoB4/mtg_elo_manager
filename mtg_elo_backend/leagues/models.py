from django.db import models
from players.models import Player
from players.services.glicko2_service import Glicko2Service, Rating
from players.services.helper import get_games_won_per_player, sum_bo3_results
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
    
    def _update_matches_played(self, p1: Player, p2: Player, games: list[int|None]) -> None:
        result = sum_bo3_results(games)
            
        p1.matches_played += 1
        p2.matches_played += 1
        if result > 0:
            p1.matches_won += 1
            p2.matches_lost += 1
        elif result < 0:
            p1.matches_lost += 1
            p2.matches_won += 1
        else:
            p1.matches_drawn += 1
            p2.matches_drawn += 1
        p1.save()
        p2.save()
    
    def rate_league_event(self, matches: list[tuple[str, str, list[int|None]]], no_diff_on_drawn: bool = False,
                          date: str | None = None) -> None:
        # Create a new tournament
        tournament = Tournament.objects.create(name=da.today().strftime('%d-%m-%Y') if date is None else date, date=da.today() if date is None else date)
        
        # Rate the tournament to keep track of de tournament ratings
        tournament.rate_tournament(
            matches, 
            no_diff_on_drawn=no_diff_on_drawn,
        )
        
        
        players_start_ratings = {}
        glicko_service = Glicko2Service()
        players_ids = []
        
        
        # For each match
        for name_p1, name_p2, games in matches:
            p1 = Player.objects.get_or_create(name=name_p1)[0] if name_p1 != 'Bye' else None
            p2 = Player.objects.get_or_create(name=name_p2)[0] if name_p2 != 'Bye' else None
            
            if p1 is not None and name_p1 not in players_start_ratings.keys():
                players_start_ratings[name_p1] = p1.rating
                players_ids.append(p1.id) # type: ignore
            if p2 is not None and name_p2 not in players_start_ratings.keys():
                players_start_ratings[name_p2] = p2.rating
                players_ids.append(p2.id) # type: ignore
            
            if not p1 or not p2:
                continue
            
            p1_wins, p2_wins = get_games_won_per_player(games)
            
            if no_diff_on_drawn and p1_wins == p2_wins:
                continue
            
            self._update_matches_played(p1, p2, games)
            
            r1_aux = glicko_service.create_rating(name_p1, p1.rating, p1.rd, p1.sigma)
            r2_aux = glicko_service.create_rating(name_p2, p2.rating, p2.rd, p2.sigma)
            
            r1 = glicko_service.create_rating(name_p1, p1.rating, p1.rd, p1.sigma)
            r2 = glicko_service.create_rating(name_p2, p2.rating, p2.rd, p2.sigma)
            
            
            # r1, r2 = glicko_service.bulk_create_from_db(name_p1, name_p2)
            # r1_aux, r2_aux = glicko_service.bulk_create_from_db(name_p1, name_p2)
            
            # For each game in the match
            
            p1_series = []
            p2_series = []
            for result in games:
                if result == 1:
                    p1_series.append((Player.WIN, r2_aux))
                    p2_series.append((Player.LOSS, r1_aux))
                    # r1 = glicko_service.rate(r1, [(Player.WIN, r2_aux)])
                    # r2 = glicko_service.rate(r2, [(Player.LOSS, r1_aux)])
                
                elif result == 0:
                    p1_series.append((Player.DRAW, r2_aux))
                    p2_series.append((Player.DRAW, r1_aux))
                    # r1 = glicko_service.rate(r1, [(Player.DRAW, r2_aux)])
                    # r2 = glicko_service.rate(r2, [(Player.DRAW, r1_aux)])
                
                elif result == -1:
                    p1_series.append((Player.LOSS, r2_aux))
                    p2_series.append((Player.WIN, r1_aux))
                    # r1 = glicko_service.rate(r1, [(Player.LOSS, r2_aux)])
                    # r2 = glicko_service.rate(r2, [(Player.WIN, r1_aux)])
                    
                # r1_aux = glicko_service.create_rating(
                #     r1.name, r1_aux.rating, r1.rd, r1.sigma,
                # )
                # r2_aux = glicko_service.create_rating(
                #     r2.name, r2_aux.rating, r2.rd, r2.sigma,
                # )

            r1 = glicko_service.rate(r1, p1_series)
            r2 = glicko_service.rate(r2, p2_series)

            glicko_service.bulk_dump_to_database((r1, r2)) # type: ignore
            
        for player in Player.objects.all():
            player.determine_last_tendency(players_start_ratings.get(player.name, player.rating))
            
            if player.id not in players_ids: # type: ignore
                r = glicko_service.create_rating(
                    player.name, player.rating, player.rd, player.sigma,
                )
                r = glicko_service.rate(r, [])
                glicko_service.bulk_dump_to_database([r])
            
    
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
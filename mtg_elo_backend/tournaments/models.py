from django.db import models, transaction
from players.models import Player
from apps.decks.models import PlayerDeck
from players.services.glicko2_service import Glicko2Service, Rating
from players.services.helper import get_games_won_per_player

# Create your models here.
class Tournament(models.Model):
    name = models.CharField('name', max_length=35, null=False)
    date = models.DateField('date', null=False, help_text='The date of the tournament.')
    players = models.ManyToManyField(
        Player, 
        related_name='tournaments', help_text='The players who participated in the tournament.'
    )
    winner = models.ForeignKey(
        Player, 
        on_delete=models.SET_NULL, null=True, 
        related_name='won_tournaments', help_text='The player who won the tournament.'
    )
    
    def bulk_dump_to_database(self, ratings: list[Rating] | tuple[Rating]) -> None:
        with transaction.atomic():
            for rating in ratings:
                tr = TournamentRating.objects.get(tournament=self, player__name=rating.name)
                tr.rating = rating.rating
                tr.rd = rating.rd
                tr.sigma = rating.sigma
                tr.save()
    
    def rate_tournament(self, matches: list[tuple[str, str, list[int|None]]], no_diff_on_drawn: bool = False) -> None:
        """Rate the tournament based on the players' performance."""
        glicko_service = Glicko2Service()
        
        matches_per_round = self.players.count() // 2
        matches_procesed = 0
        round = Round.objects.create(tournament=self, number=1)
        
        for name_p1, name_p2, games in matches:
            p1 = Player.objects.get_or_create(name=name_p1)[0] if name_p1 != 'Bye' else None
            p2 = Player.objects.get_or_create(name=name_p2)[0] if name_p2 != 'Bye' else None
            
            tr1 = TournamentRating.objects.get_or_create(tournament=self, player=p1)[0] if p1 else None
            tr2 = TournamentRating.objects.get_or_create(tournament=self, player=p2)[0] if p2 else None
             
            if p1 is not None and not self.players.filter(name=name_p1).exists():
                self.players.add(p1)
            if p2 is not None and not self.players.filter(name=name_p2).exists():
                self.players.add(p2)
            
            if not tr1 or not tr2:
                continue
            
            if matches_procesed == matches_per_round:
                round = Round.objects.create(tournament=self, number=self.rounds.count() + 1) # type: ignore
                matches_procesed = 0
            
            p1_wins, p2_wins = get_games_won_per_player(games)
            
            Match.objects.create(
                round=round, 
                player1=p1, 
                player2=p2, 
                player1_score=p1_wins,
                player2_score=p2_wins,
                winner=p1 if p1_wins > p2_wins else (p2 if p2_wins > p1_wins else None)
            )
            
            if no_diff_on_drawn and p1_wins == p2_wins:
                continue
            
            r1_aux = glicko_service.create_rating(name_p1, tr1.rating, tr1.rd, tr1.sigma)
            r2_aux = glicko_service.create_rating(name_p2, tr2.rating, tr2.rd, tr2.sigma)
            
            r1 = glicko_service.create_rating(name_p1, tr1.rating, tr1.rd, tr1.sigma)
            r2 = glicko_service.create_rating(name_p2, tr2.rating, tr2.rd, tr2.sigma)
            
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
                #     r1.name, r1.rating, r1.rd, r1.sigma,
                # )
                # r2_aux = glicko_service.create_rating(
                #     r2.name, r2.rating, r2.rd, r2.sigma,
                # )
            
            r1 = glicko_service.rate(r1, p1_series)
            r2 = glicko_service.rate(r2, p2_series)
            
            self.bulk_dump_to_database((r1, r2)) # type: ignore
            # tr1.update(r1)
            # tr2.update(r2)
            matches_procesed += 1
            
        # self.winner = self.players.order_by('-ratings__rating').first()
        self.winner = self.ratings.order_by('-rating').first().player if self.ratings.exists() else None # type: ignore
        self.save()

    
    def __str__(self) -> str:
        return f'{self.name} ({self.date}): Winner: {self.winner.name if self.winner else "Deleted"}'
    
    class Meta:
        ordering = ['-date']
        

class Round(models.Model):
    """Model representing a round in a tournament."""
    
    tournament = models.ForeignKey(
        Tournament, 
        on_delete=models.CASCADE, 
        related_name='rounds', help_text='The tournament this round belongs to.'
    )
    number = models.IntegerField('Round Number', null=False, help_text='The number of the round in the tournament.')
    
    def __str__(self) -> str:
        return f'Round {self.number} of {self.tournament.name}'
    
    class Meta:
        ordering = ['tournament__date', 'number']


class Match(models.Model):
    """Model representing a match in a tournament."""
    
    round = models.ForeignKey(
        Round, 
        on_delete=models.CASCADE, 
        related_name='matches', help_text='The round this match belongs to.'
    )
    player1 = models.ForeignKey(
        Player, 
        on_delete=models.CASCADE, 
        related_name='matches_as_player1', help_text='The first player in the match.'
    )
    player2 = models.ForeignKey(
        Player, 
        on_delete=models.CASCADE, 
        related_name='matches_as_player2', help_text='The second player in the match.'
    )
    winner = models.ForeignKey(
        Player, 
        on_delete=models.SET_NULL, null=True, 
        related_name='won_matches', help_text='The player who won the match.'
    )
    player1_score = models.IntegerField(
        'Player 1 Score', 
        null=False, default=0, 
        help_text='The score of player 1 in the match.'
    )
    player2_score = models.IntegerField(
        'Player 2 Score', 
        null=False, default=0, 
        help_text='The score of player 2 in the match.'
    )
    winner_deck = models.ForeignKey(
        PlayerDeck,
        on_delete=models.SET_NULL, null=True,
        related_name='won_matches',
        help_text='The deck used by the winner in the match.'
    )
    looser_deck = models.ForeignKey(
        PlayerDeck,
        on_delete=models.SET_NULL, null=True,
        related_name='lost_matches',
        help_text='The deck used by the looser in the match.'
    )

    
    def __str__(self) -> str:
        return f'Match: {self.player1.name}[{self.player1_score}] vs {self.player2.name}[{self.player2_score}] - {f"Winner: {self.winner.name}" if self.winner else "Draw"}'
    
    class Meta:
        ordering = ['round__tournament__date', 'round__number']
        
        
class TournamentRating(models.Model):
    tournament = models.ForeignKey(
        Tournament, 
        on_delete=models.CASCADE, related_name='ratings', 
        help_text='The tournament to which this rating belongs.'
    )
    player = models.ForeignKey(
        Player, 
        on_delete=models.CASCADE, related_name='ratings', 
        help_text='The player to whom this rating belongs.'
    )
    rating = models.FloatField(
        'rating', null=False, default=Player.DEFAULT_RATING,
        help_text='The rating of the player in the tournament.'
    )
    rd = models.FloatField(
        'RD', null=False, default=Player.DEFAULT_RD,
        help_text='Rating Deviation of the player in the tournament.'
    )
    sigma = models.FloatField(
        'vol',
        null=False, default=Player.SIGMA,
        help_text='The volatility of the player\'s rating in the tournament.'
    )
    
    def update(self, rating: Rating) -> None:
        """Update the rating of the player in the tournament."""
        self.rating = rating.rating
        self.rd = rating.rd
        self.sigma = rating.sigma
        self.save()
    
    def __str__(self) -> str:
        return f'{self.player.name:<35}|{self.rating:^6}|{round(self.rd, 8):^14}|'
    
    class Meta:
        ordering = ['tournament__date', '-rating', 'rd']

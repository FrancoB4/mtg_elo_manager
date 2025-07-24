from django.db.models import Q
from django.db import models, transaction
from ..players.models import Player
from ..decks.models import PlayerDeck
from services.helper import Rating

# Create your models here.
class Tournament(models.Model):
    name = models.CharField('name', max_length=35, null=False)
    date = models.DateField('date', null=False, help_text='The date of the tournament.')
    winner = models.ForeignKey(
        Player, 
        on_delete=models.SET_NULL, null=True, 
        related_name='won_tournaments', help_text='The player who won the tournament.'
    )
    league = models.ForeignKey(
        'leagues.League',
        on_delete=models.SET_NULL, null=True,
        related_name='tournaments', help_text='The league to which this tournament belongs.'
    )
    
    def bulk_dump_to_database(self, ratings: list[Rating] | tuple[Rating]) -> None:
        with transaction.atomic():
            for rating in ratings:
                tr = TournamentPlayer.objects.get(tournament=self, player__name=rating.name)
                tr.rating = rating.rating
                tr.rd = rating.rd
                tr.sigma = rating.sigma
                tr.save()
    
    def get_or_create_tournament_rating(self, player: Player) -> tuple:
        """Create or get the tournament rating for a player."""
        tr, created = TournamentPlayer.objects.get_or_create(
            tournament=self, 
            player=player
        )
        return tr, created
    
    def export_to_csv(self) -> bool:
        """Return a CSV representation of the tournament."""
        import os

        if os.path.exists(f'./exports/tournaments/{self.date.strftime("%Y-%m-%d")}.csv'):
            return False

        matches = Match.objects.filter(round__tournament=self)
        with open(f'./exports/tournaments/{self.date.strftime("%Y-%m-%d")}.csv', 'w') as file:
            for match in matches:
                file.write(match.to_csv() + '\n')
        return True
        
    def create_match(self, player1: Player | None, player2: Player | None, games: list[int | None], round_number: int | None = None) -> 'Match':
        from services.helper import get_games_won_per_player
        queryset = Match.objects.filter(Q(round__tournament=self))
        
        player1_score, player2_score = get_games_won_per_player(games)
        
        if round_number is None:
            round_number = max(
                queryset.filter(Q(player1=player1) | Q(player2=player1)).count() + 1,
                queryset.filter(Q(player1=player2) | Q(player2=player2)).count() + 1,
            )
        
        return Match.objects.create(
            round=self.rounds.get(number=round_number), # type: ignore
            player1=player1,
            player2=player2,
            player1_score=player1_score,
            player2_score=player2_score,
            winner=player1 if player1_score > player2_score else player2 if player2_score > player1_score else None,
        )
        
    def set_winner(self):
        """Set the winner of the tournament."""
        if self.winner is None:
            self.winner = self.ratings.order_by('-rating').first().player # type: ignore
            self.save()
    
    def clean_empty_rounds(self):
        """Remove empty rounds from the tournament."""
        for round in self.rounds.all(): # type: ignore
            if not round.matches.exists():
                round.delete()
    
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
        Player, null=True,
        on_delete=models.CASCADE, 
        related_name='matches_as_player1', help_text='The first player in the match.'
    )
    player2 = models.ForeignKey(
        Player, null=True,
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

    def to_csv(self) -> str:
        """Return a CSV representation of the match."""
        return f'{self.player1.name if self.player1 else "Bye"},{self.player1_score}-{self.player2_score},{self.player2.name if self.player2 else "Bye"}'

    def __str__(self) -> str:
        return f'{self.player1.name if self.player1 else "Bye"}[{self.player1_score}] vs {self.player2.name if self.player2 else "Bye"}[{self.player2_score}]'

    class Meta:
        ordering = ['round__tournament__date', 'round__number']
        
        
class TournamentPlayer(models.Model):
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
        'rating', null=False, default=Rating.DEFAULT_RATING,
        help_text='The rating of the player in the tournament.'
    )
    rd = models.FloatField(
        'RD', null=False, default=Rating.DEFAULT_RD,
        help_text='Rating Deviation of the player in the tournament.'
    )
    sigma = models.FloatField(
        'vol',
        null=False, default=Rating.SIGMA,
        help_text='The volatility of the player\'s rating in the tournament.'
    )
    
    def update_stats(self, rating: Rating) -> None:
        """Update the rating of the player in the tournament."""
        self.rating = rating.rating
        self.rd = rating.rd
        self.sigma = rating.sigma
        self.save()
    
    def __str__(self) -> str:
        return f'{self.player.name:<35}|{self.rating:^6}|{round(self.rd, 8):^14}|'
    
    class Meta:
        ordering = ['tournament__date', '-rating', 'rd']

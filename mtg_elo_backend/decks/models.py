from django.db import models
from players.models import Player

# Create your models here.
class Deck(models.Model):
    name = models.CharField('name', max_length=35, null=False, unique=True)
    description = models.TextField(
        'description', 
        null=True, blank=True, 
        help_text='A brief description of the deck.'
    )
    
    def __str__(self) -> str:
        return f'{self.name}'
    
    class Meta:
        ordering = ['name']
        
class PlayerDeck(models.Model):
    player = models.ForeignKey(
        Player, 
        on_delete=models.CASCADE, 
        related_name='decks', help_text='The player who owns the deck.'
    )
    deck = models.ForeignKey(
        Deck, 
        on_delete=models.CASCADE, 
        related_name='players', help_text='The deck owned by the player.'
    )
    
    
    def __str__(self) -> str:
        return f'{self.player.name} - {self.deck.name}'
    
    class Meta:
        unique_together = ('player', 'deck')
        ordering = ['player__name', 'deck__name']
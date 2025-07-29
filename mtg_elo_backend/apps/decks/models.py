from django.db import models
from ..games_and_formats.models import Game, Format

# Create your models here.
class DeckArchetype(models.Model):
    """
    Model representing a deck archetype.
    """
    name = models.CharField('name', max_length=100, null=False, unique=True)
    description = models.TextField(
        'description', 
        null=True, blank=True, 
        help_text='A brief description of the deck archetype.'
    )
    game = models.ForeignKey(
        Game, 
        on_delete=models.CASCADE,
        null=False,
        related_name='archetypes',
        help_text='The game this archetype belongs to.'
    )
    
    def __str__(self) -> str:
        return f'{self.name}'
    
    class Meta:
        ordering = ['game__id','name']
        

class DeckArchetypeFormat(models.Model):
    """
    Model representing a format for a deck archetype.
    """
    archetype = models.ForeignKey(
        DeckArchetype, 
        on_delete=models.CASCADE, 
        related_name='formats', 
        help_text='The archetype this format belongs to.'
    )
    format = models.ForeignKey(
        Format, 
        on_delete=models.CASCADE, 
        related_name='archetypes', 
        help_text='The format of the archetype.'
    )
    
    def __str__(self) -> str:
        return f'{self.archetype.name} in {self.format.name}'
    
    class Meta:
        unique_together = ('archetype', 'format')
        ordering = ['format__game__id', 'format__id', 'archetype__name']


class Deck(models.Model):
    name = models.CharField('name', max_length=35, null=False, unique=True)
    description = models.TextField(
        'description', 
        null=True, blank=True, 
        help_text='A brief description of the deck.'
    )
    list = models.TextField(
        'list', 
        null=True, 
        help_text='The list of cards in the deck, formatted as a string.'
    )
    archetype = models.ForeignKey(
        DeckArchetype, 
        on_delete=models.CASCADE, 
        related_name='decks',
        null=True, blank=True,
        help_text='The archetype of the deck.'
    )

    def __str__(self) -> str:
        return f'{self.name}'
    
    class Meta:
        ordering = ['archetype__game__id', 'archetype__id', 'name']


class Card(models.Model):
    name = models.CharField('name', max_length=100, null=False, unique=True)
    description = models.TextField(
        'description',
        null=True, blank=True,
        help_text='A brief description of the card.'
    )
    game = models.ForeignKey(
        Game, null=False,
        on_delete=models.CASCADE,
        related_name='cards',
        help_text='The game this card belongs to.'
    )
    
    def __str__(self) -> str:
        return f'Card: {self.name}'
    
    class Meta:
        unique_together = ('name', 'game')
        ordering = ['game__id', 'name']
        
        
class CardDeck(models.Model):
    deck = models.ForeignKey(
        Deck, 
        on_delete=models.CASCADE, 
        related_name='cards', 
        help_text='The deck this card belongs to.'
    )
    card = models.ForeignKey(
        Card, 
        on_delete=models.CASCADE, 
        related_name='decks', 
        help_text='The card in the deck.'
    )
    quantity = models.PositiveIntegerField(
        'quantity', 
        default=1, 
        help_text='The number of copies of this card in the deck.'
    )
    
    def __str__(self) -> str:
        return f'{self.quantity} x {self.card.name} in {self.deck.name}'
    
    class Meta:
        unique_together = ('deck', 'card')
        ordering = ['card__game__id', 'deck__name', 'card__name']


class CardFormat(models.Model):
    class LegalityState(models.TextChoices):
        LEGAL = 'Legal', 'Legal'
        BANNED = 'Banned', 'Banned'
        RESTRICTED = 'Restricted', 'Restricted'
        ILLEGAL = 'Illegal', 'Illegal'

    card = models.ForeignKey(
        Card, 
        on_delete=models.CASCADE, 
        related_name='formats', 
        help_text='The card in the format.'
    )
    format = models.ForeignKey(
        Format, 
        on_delete=models.CASCADE, 
        related_name='cards', 
        help_text='The format this card belongs to.'
    )
    legalityState = models.CharField(
        'legality state',
        choices=LegalityState.choices,
        max_length=10,
        default=LegalityState.LEGAL,
        help_text='The legality state of the card in the format.'
    )
    
    
    def __str__(self) -> str:
        return f'{self.card.name} in {self.format.name}'
    
    class Meta:
        unique_together = ('card', 'format')
        ordering = ['format__game__id', 'format__id', 'card__name']
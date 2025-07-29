from django.db import models

# Create your models here.
class Game(models.Model):
    """
    Model representing a game format.
    """
    name = models.CharField(max_length=100, unique=True, help_text='The name of the game.')
    description = models.TextField(blank=True, help_text='A brief description of the game.')
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Game'
        verbose_name_plural = 'Games'
        ordering = ['name']
        
    
class Format(models.Model):
    """
    Model representing a game format.
    """
    name = models.CharField(max_length=100, unique=True, help_text='The name of the format.')
    description = models.TextField(blank=True, help_text='A brief description of the format.')
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='formats', help_text='The game this format belongs to.')
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Format'
        verbose_name_plural = 'Formats'
        ordering = ['name']
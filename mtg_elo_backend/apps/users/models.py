import pyotp

from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        LEAGUE_ADMIN = 'LEAGUE_ADMIN', 'Administrador de Ligas'
        TOURNAMENT_ADMIN = 'TOURNAMENT_ADMIN', 'Administrador de Torneos',
        PLAYER = 'PLAYER', 'Jugador'
        

    is_2fa_enabled = models.BooleanField(default=False)
    otp_secret = models.CharField(max_length=32, blank=True, null=True)
    
    base_role = models.CharField(max_length=50, choices=Role.choices, default=Role.PLAYER, help_text='The base role of the user.')
    
    must_change_password = models.BooleanField(
        default=False, 
        help_text='Indicates if the user must change their password on next login.'
    )
    
    def enable_2fa(self):
        self.is_2fa_enabled = True
        self.save()
    
    def generate_2fa_secret(self):
        if not self.is_2fa_enabled:
            self.otp_secret = pyotp.random_base32()
            self.save()

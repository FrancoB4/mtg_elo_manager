from django.db import models
from django.contrib.auth.models import AbstractUser
import pyotp

# Create your models here.
# class CustomUser(AbstractUser):
#     class Role(models.TextChoices):
#         GENERAL_ADMIN = 'GENERAL_ADMIN', 'Administrador General'
#         COMPANY_USER = 'COMPANY_USER', 'Usuario de Empresa'
#         GROUP_USER = 'GROUP_USER', 'Usuario de Grupo'

#     is_2fa_enabled = models.BooleanField(default=False)
#     otp_secret = models.CharField(max_length=32, blank=True, null=True)
    
#     base_role = models.CharField(max_length=50, choices=Role.choices, default=Role.COMPANY_USER)
    
#     def enable_2fa(self):
#         self.is_2fa_enabled = True
#         self.save()
    
#     def generate_2fa_secret(self):
#         if not self.is_2fa_enabled:
#             self.otp_secret = pyotp.random_base32()
#             self.save()
            
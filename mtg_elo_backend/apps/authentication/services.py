import pyotp
from django.db import transaction
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.authentication import get_authorization_header
from rest_framework import exceptions

from apps.users.models import CustomUser

class TwoFactorService:
    user = None
    totp = None
    
    def __init__(self, user: CustomUser) -> None:
        self.user = user
        
        if self.user.otp_secret:
            self.totp = pyotp.TOTP(self.user.otp_secret)
        else:
            with transaction.atomic():
                self.user.generate_2fa_secret()
                self.totp = pyotp.TOTP(self.user.otp_secret) # type: ignore
    
    def verify_2fa_code(self, code: str) -> bool:
        if self.totp is not None:
            return self.totp.verify(code)
        return False   
    
    def get_2fa_enabling_uri(self, user):
        if self.totp is not None:
            return self.totp.provisioning_uri(name=user.username, issuer_name='MTG Elo Manager')
        
    def enable_2fa(self):
        if self.user and self.user.otp_secret and not self.user.is_2fa_enabled:
            self.user.enable_2fa()
            return True
        return False
        

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Se usa el token desde la cookie, no el header
        raw_token = request.COOKIES.get('access')
        
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
        except InvalidToken:
            raise exceptions.AuthenticationFailed('Invalid token', code='invalid_token')
        
        return self.get_user(validated_token), validated_token
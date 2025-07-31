from django.conf import settings
from django.contrib.auth import authenticate

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView, ListCreateAPIView
from rest_framework.response import Response

from .serializers import CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer, CustomTokenVerifySerializer
from .services import TwoFactorService

from ..users.permissions import IsSuperUser, IsSelf
from ..users.models import CustomUser
from ..users.serializers import CustomUserSimpleSerializer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class CustomTokenRefreshView(TokenRefreshView):
    """
    This view is used to refresh JWT tokens.
    """
    serializer_class = CustomTokenRefreshSerializer
    permission_classes = [permissions.AllowAny]
    

class AuthenticateUserAndPasswordView(GenericAPIView):
    """ This view is used to authenticate a user with username and password.
    It returns the username and whether 2FA is required for the user.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request):
        username = request.data.get('username', None)
        password = request.data.get('password', None)
        
        if not username or not password:
            return Response({ 'detail': 'Faltan datos obligatorios.' }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        if not user:
            return Response({ 'detail': 'Usuario invalido.' }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(data={'username': username, 'password': request.data.get('password', '')})
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data
        
        res = Response({
            'username': user.username,
            'require_2fa': user.is_2fa_enabled,
            'must_reset_password': user.must_change_password,
        })
        
        if not user.is_2fa_enabled: # type: ignore
            
            res.set_cookie(
                'access', value=tokens.get('access', None), max_age=15*60, httponly=True, secure=True, samesite='None', path='/'
            )
            res.set_cookie(
                'refresh', value=tokens.get('refresh', None), max_age=24*60*60, httponly=True, secure=True, samesite='None', path='/'
            )
        
        return res


class Enable2faView(GenericAPIView):
    """
    This view is used to enable 2FA for a user.
    It generates a secret and returns the otpauth URI for the user.
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, format=None):
        user = request.user
        if not user:
            return Response({'detail': 'Usuario incorrecto.'}, status=status.HTTP_404_NOT_FOUND)
        
        if user.is_2fa_enabled:
            return Response({'detail': '2Fa ya está habilitado.'}, status=status.HTTP_400_BAD_REQUEST)
        
        tfs = TwoFactorService(user)
        uri = tfs.get_2fa_enabling_uri(user)
        
        return Response({'otpauth_uri': uri})
        
        
class Verify2faView(TokenObtainPairView):
    """ This view is used to verify the 2FA code for a user.
    It returns JWT tokens if the code is valid and 2FA is enabled.
    If 2FA is not enabled, it enables it for the user.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username', None)
        code = request.data.get('code', None)
        
        if not username or not code:
            return Response({ 'detail': 'Faltan datos obligatorios.' }, status=status.HTTP_400_BAD_REQUEST)
        
        user = CustomUser.objects.filter(username=username).first()
        if not user:
            return Response({ 'detail': 'Usuario invalido.' }, status=status.HTTP_404_NOT_FOUND)
        
        tfs = TwoFactorService(user)
        
        if not tfs.verify_2fa_code(code) and settings.ENABLE_2FA:
            return Response({ 'detail': 'Código invalido.' }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data={'username': username, 'password': request.data.get('password', '')})
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data
        
        if not user.is_2fa_enabled:
            tfs.enable_2fa()
        
        res = Response({ 'detail': 'Ok', 'success': True })
        res.set_cookie(
            'access', value=tokens.get('access', None), max_age=15*60, httponly=True, secure=True, samesite='None', path='/'
        )
        res.set_cookie(
            'refresh', value=tokens.get('refresh', None), max_age=24*60*60, httponly=True, secure=True, samesite='None', path='/'
        )
        
        return res


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        res = Response({'detail': 'Logged out'}, status=status.HTTP_200_OK)
        res.delete_cookie('access', path='/')
        res.delete_cookie('refresh', path='/')
        return res


class CustomTokenVerifyView(TokenVerifyView):
    serializer_class = CustomTokenVerifySerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get token from cookies
            token = request.COOKIES.get('access')
            if token:
                try:
                    # Decode token to get user
                    validated_token = AccessToken(token)
                    user_id = validated_token['user_id']
                    user = CustomUser.objects.get(id=user_id)
                    
                    # Add user data to response
                    response.data = {
                        'id': user.id, # type: ignore
                        'username': user.username,
                        'email': user.email,
                        'is_superuser': user.is_superuser,
                        'roles': [user.base_role]
                    }
                except (TokenError, InvalidToken, CustomUser.DoesNotExist):
                    pass
        
        return response
    
    
class UserManagementView(ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSimpleSerializer
    permission_classes = [IsSuperUser]
    

class Reset2FAView(GenericAPIView):
    """
    This view is used to reset 2FA for a user.
    It disables 2FA and returns a success message.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        if not user:
            return Response({'detail': 'Usuario incorrecto.'}, status=status.HTTP_404_NOT_FOUND)
        
        if not user.is_2fa_enabled:
            return Response({'detail': '2Fa no está habilitado.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_2fa_enabled = False
        user.save()
        
        return Response({'detail': '2Fa deshabilitado correctamente.'}, status=status.HTTP_200_OK)
    

class ChangePasswordView(GenericAPIView):
    """
    View to change the password of the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({'error': 'Both old_password and new_password are required.'}, status=400)
        
        if not user.check_password(old_password):
            return Response({'error': 'Current password is incorrect.'}, status=400)
        
        user.set_password(new_password)
        user.must_change_password = False
        user.save()
        
        return Response({'message': 'Password changed successfully.'}, status=200)

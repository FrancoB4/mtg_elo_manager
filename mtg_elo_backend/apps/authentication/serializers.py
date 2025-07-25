from django.forms import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer, TokenVerifySerializer
from rest_framework.serializers import CharField, ModelSerializer
# from django.contrib.auth import authenticate
# from apps.users.models import CustomUser


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['id'] = user.id
        token['email'] = user.email
        token['username'] = user.username

        return token


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    # Como el token viene en la cookie, se necesita que el serializer no rechace la petición
    # automáticamente si no encuentra el campo 'refresh'.
    refresh = CharField(required=False)
    
    def validate(self, attrs):
        if not attrs.get('refresh') and 'request' in self.context:
            request = self.context['request']
            refresh_cookie = request.COOKIES.get('refresh')
            if refresh_cookie:
                attrs['refresh'] = refresh_cookie
        return super().validate(attrs)


class CustomTokenVerifySerializer(TokenVerifySerializer):
    token = CharField(required=False)
    
    def validate(self, attrs):
        if not attrs.get('token') and 'request' in self.context:
            request = self.context['request']
            access = request.COOKIES.get('access')
            if access:
                attrs['token'] = access
            else:
                raise ValidationError({'access': 'The token was not provided.'})
        return super().validate(attrs)
    

# class CustomUserSerializer(ModelSerializer):
    
#     class Meta:
#         model = CustomUser
#         fields = ['id', 'username', 'first_name', 'last_name', 'email']
    
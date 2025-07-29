from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from .views import ChangePasswordView, Enable2faView, Verify2faView, AuthenticateUserAndPasswordView, \
    CustomTokenVerifyView, LogoutView, CustomTokenRefreshView,Reset2FAView


urlpatterns = [
    path('', AuthenticateUserAndPasswordView.as_view(), name='auth_user_password'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('2fa/enable/', Enable2faView.as_view(), name='2fa_enable'),
    path('2fa/verify/', Verify2faView.as_view(), name='2fa_verify'),
    path('me/', CustomTokenVerifyView.as_view(), name='me'),
    path('2fa/disable/', Reset2FAView.as_view(), name='2fa_disable'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
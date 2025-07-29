from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from .views import CreateUserView, UserDetailView

from django.urls import include, path
from rest_framework.routers import DefaultRouter


urlpatterns = [
    path('register/', CreateUserView.as_view(), name='register'),
    path('profile/<str:username>/', UserDetailView.as_view(), name='user-detail'),
]

# urlpatterns = format_suffix_patterns(urlpatterns)
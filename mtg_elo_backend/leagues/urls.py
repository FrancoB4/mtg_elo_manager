from django.urls import include, path
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework.routers import DefaultRouter
from .views import LeagueViewSet

router = DefaultRouter()
router.register(r'', LeagueViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls))
]
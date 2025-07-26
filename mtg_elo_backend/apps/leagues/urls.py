from django.urls import include, path
from rest_framework.urlpatterns import format_suffix_patterns
from rest_framework.routers import DefaultRouter
from .views import LeaguePlayerViewSet, LeagueViewSet

router = DefaultRouter()
router.register(r'', LeagueViewSet, basename='user')
router.register(r'(?P<league_pk>[^/.]+)/players', LeaguePlayerViewSet, basename='league-players')

urlpatterns = [
    path('', include(router.urls))
]
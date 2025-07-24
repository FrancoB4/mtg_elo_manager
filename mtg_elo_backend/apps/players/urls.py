from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.tournaments.views import MatchViewSet
from .views import PlayerViewSet

router = DefaultRouter()
router.register(r'(?P<player_id>[^/.]+)/matches', MatchViewSet, basename='player-matches')
router.register(r'', PlayerViewSet, basename='players')

urlpatterns = [
    path('', include(router.urls)),
]
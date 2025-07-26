from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import MatchViewSet, TournamentViewSet, EndTournamentView, TournamentPlayerViewSet

router = DefaultRouter()
router.register(r'', TournamentViewSet)
router.register(r'(?P<tournament_id>[^/.]+)/matches', MatchViewSet, basename='tournament-matches')
router.register(r'(?P<tournament_name>[^/.]+)/players', TournamentPlayerViewSet, basename='tournament-players')

urlpatterns = [
    path('', include(router.urls)),
    path('end/', EndTournamentView.as_view(), name='end-tournament'),
]
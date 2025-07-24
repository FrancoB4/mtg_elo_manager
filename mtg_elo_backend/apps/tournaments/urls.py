from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import MatchViewSet, TournamentViewSet, EndTournamentView

router = DefaultRouter()
router.register(r'', TournamentViewSet)
router.register(r'(?P<tournament_id>[^/.]+)/matches', MatchViewSet, basename='tournament-matches')

urlpatterns = [
    path('', include(router.urls)),
    path('end/', EndTournamentView.as_view(), name='end-tournament'),
]
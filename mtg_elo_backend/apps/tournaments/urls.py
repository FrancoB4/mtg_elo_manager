from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import MatchViewSet, TournamentCSVExportView, TournamentViewSet, EndTournamentView, TournamentPlayerViewSet

router = DefaultRouter()
router.register(r'', TournamentViewSet)
router.register(r'(?P<tournament_id>[^/.]+)/matches', MatchViewSet, basename='tournament-matches')
router.register(r'(?P<tournament_id>[^/.]+)/players', TournamentPlayerViewSet, basename='tournament-players')

urlpatterns = [
    path('', include(router.urls)),
    path('end/<int:tournament_id>/', EndTournamentView.as_view(), name='end-tournament'),
    path('export/<int:tournament_id>/', TournamentCSVExportView.as_view(), name='export-tournament-by-id'),
]
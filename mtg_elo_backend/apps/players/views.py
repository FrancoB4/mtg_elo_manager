from django.shortcuts import render
from django.db.models import Avg, Max, Min
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.leagues.models import LeaguePlayer
from apps.tournaments.models import Match, Tournament, TournamentPlayer

from .models import Player
from .serializers import PlayerSerializer, GlobalPlayerStatisticsSerializer, FeaturedPlayerSerializer

from apps.users.permissions import IsSelf, IsLeagueAdmin, IsTournamentAdmin

# Create your views here.
class PlayerViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing player instances.
    """
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsLeagueAdmin | IsTournamentAdmin]
            
        return [permission() for permission in permission_classes]
    
    
    def list(self, request, *args, **kwargs):
        """
        Handle GET requests for listing players.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class GlobalPlayerStatisticsView(generics.GenericAPIView):
    """
    A viewset for viewing global player statistics.
    """
    queryset = Player.objects.all()
    serializer_class = GlobalPlayerStatisticsSerializer
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        """
        Handle GET requests for global player statistics.
        """
        
        league_id = request.query_params.get('league_id', None)
        tournament_id = request.query_params.get('tournament_id', None)
        
        if league_id:
            self.queryset = LeaguePlayer.objects.filter(league__id=league_id)
        elif tournament_id:
            self.queryset = TournamentPlayer.objects.filter(tournament__id=tournament_id)
        
        total_players = self.queryset.count()
        total_tournaments = Tournament.objects.count() if not tournament_id else None
        total_matches = Match.objects.count() if not tournament_id else Match.objects.filter(round__tournament__id=tournament_id).count()
        average_rating = self.queryset.aggregate(Avg('rating'))['rating__avg'] or 0.0
        
        # Obtener jugadores destacados
        most_active = self.queryset.order_by('-matches_played').first() if total_players > 0 else None
        highest_rated = self.queryset.order_by('-rating').first() if total_players > 0 else None
        lowest_rated = self.queryset.order_by('rating').first() if total_players > 0 else None
        
        if league_id or tournament_id:
            most_active_name = most_active.player.name if most_active else 'N/A' # type: ignore
            highest_rated_name = highest_rated.player.name if highest_rated else 'N/A' # type: ignore
            lowest_rated_name = lowest_rated.player.name if lowest_rated else 'N/A' # type: ignore
        else:
            most_active_name = most_active.name if most_active else None # type: ignore
            highest_rated_name = highest_rated.name if highest_rated else None # type: ignore
            lowest_rated_name = lowest_rated.name if lowest_rated else None # type: ignore
        
        # Convertir a formato de diccionario para FeaturedPlayerSerializer
        most_active_data = {
            'name': most_active_name,
            'rating': float(most_active.rating) if most_active else 0.0,
            'matches_played': most_active.matches_played if most_active else 0
        }
        
        highest_rated_data = {
            'name': highest_rated_name,
            'rating': float(highest_rated.rating) if highest_rated else 0.0,
            'matches_played': highest_rated.matches_played if highest_rated else 0
        }
        
        lowest_rated_data = {
            'name': lowest_rated_name,
            'rating': float(lowest_rated.rating) if lowest_rated else 0.0,
            'matches_played': lowest_rated.matches_played if lowest_rated else 0
        }

        data = {
            'total_players': total_players,
            'total_tournaments': total_tournaments,
            'total_matches': total_matches,
            'average_rating': average_rating,
            'most_active_player': most_active_data,
            'highest_rated_player': highest_rated_data,
            'lowest_rated_player': lowest_rated_data
        }

        serializer = self.serializer_class(data)
        return Response(serializer.data)

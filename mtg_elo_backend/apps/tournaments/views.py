from django.db.models import Q

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.players.models import Player
from apps.tournaments.models import Match, Tournament, TournamentPlayer
from apps.tournaments.serializers import TournamentPlayerSerializer, MatchSerializer, TournamentSerializer
from apps.users import permissions

from services.glicko2_service import Glicko2Service

# Create your views here.
class TournamentViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing tournament instances.
    """
    queryset = Tournament.objects.all()  
    serializer_class = TournamentSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permissions_classes = [AllowAny]
        else:
            permissions_classes = [permissions.IsTournamentAdmin | permissions.IsLeagueAdmin]
            
        return [permission() for permission in permissions_classes]

    def list(self, request, *args, **kwargs):
        """
        List all tournaments.
        """
        if request.data.get('league_id'):
            league_id = request.data['league_id']
            self.queryset = self.queryset.filter(league__id=league_id)
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new tournament.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=201)


class EndTournamentView(APIView):
    """
    View to end a tournament.
    """
    permission_classes = [permissions.IsTournamentAdmin | permissions.IsLeagueAdmin]

    def post(self, _, *args, **kwargs):
        tournament_id = kwargs.get('tournament_id')
        try:
            tournament = Tournament.objects.get(id=tournament_id)
            tournament.set_winner()
            tournament.clean_empty_rounds()
            tournament.export_to_csv()
            return Response({'status': 'Tournament ended successfully'}, status=200)
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found'}, status=404)


class MatchViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing match instances in a tournament.
    """
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permissions_classes = [AllowAny]
        elif self.action == 'create':
            permissions_classes = [IsAuthenticated]
        else:
            permissions_classes = [permissions.IsTournamentAdmin | permissions.IsLeagueAdmin]
            
        return [permission() for permission in permissions_classes]
    
    def list(self, request, *args, **kwargs):
        """
        List all matches in a tournament or/and for a player.
        """
        tournament_id = kwargs.get('tournament_id', request.query_params.get('tournament_id', None))
        player_id = kwargs.get('player_id', request.query_params.get('player_id', None))
        
        if not tournament_id and not player_id:
            return Response({'error': 'Either tournament_id or player_id must be provided'}, status=400)
        
        filters = []
        if tournament_id:
            filters.append(Q(round__tournament__id=tournament_id))
        if player_id:
            filters.append(Q(player1__id=player_id) | Q(player2__id=player_id))
        
        queryset = self.get_queryset().filter(*filters).order_by('-round__tournament__date', '-round__number')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new match in a tournament.
        """
        tournament_id = kwargs.get('tournament_id')
        player1_id = request.data.get('player1_id')
        player2_id = request.data.get('player2_id')
        games = request.data.get('games', [])
        round_number = request.data.get('round_number', 1)

        glico_service = Glicko2Service()
        
        try:
            tournament = Tournament.objects.get(id=tournament_id)
            player1 = Player.objects.get(id=player1_id)
            player2 = Player.objects.get(id=player2_id)
            match = glico_service.rate_1vs1(player1, player2, games, tournament, round_number)
            serializer = self.get_serializer(match)
            return Response({'status': 'Match created successfully', 'match': serializer.data}, status=201) # type: ignore
        except (Tournament.DoesNotExist, Player.DoesNotExist) as e:
            return Response({'error': str(e)}, status=404)
        

class TournamentPlayerViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing tournament player instances.
    """
    queryset = TournamentPlayer.objects.all()
    serializer_class = TournamentPlayerSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permissions_classes = [AllowAny]
        elif self.action == 'create':
            permissions_classes = [IsAuthenticated]
        else:
            permissions_classes = [permissions.IsTournamentAdmin | permissions.IsLeagueAdmin]
            
        return [permission() for permission in permissions_classes]
    
    def list(self, request, *args, **kwargs):
        """
        List all tournament players.
        """
        if request.data.get('tournament_id'):
            tournament_id = request.data['tournament_id']
            self.queryset = self.queryset.filter(tournament__id=tournament_id)
        elif request.data.get('player_id'):
            player_id = request.data['player_id']
            self.queryset = self.queryset.filter(player__id=player_id)
        else:
            raise ValueError("Either 'tournament_id' or 'player_id' must be provided in the request data.")
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
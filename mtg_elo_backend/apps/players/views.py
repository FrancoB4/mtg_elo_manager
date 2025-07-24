from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Player
from .serializers import PlayerSerializer

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
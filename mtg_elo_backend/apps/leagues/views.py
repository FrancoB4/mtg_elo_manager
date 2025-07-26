from django.db.models import Q
from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny

from apps.users import permissions
from .serializers import LeagueSerializer, LeaguePlayerSerializer
from .models import League, LeaguePlayer
from rest_framework.response import Response

# Create your views here.
class LeagueViewSet(ModelViewSet):
    queryset = League.objects.all()
    serializer_class = LeagueSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permissions_classes = [AllowAny]
        else:
            permissions_classes = [permissions.IsLeagueAdmin | permissions.IsTournamentAdmin]
        
        return [permission() for permission in permissions_classes]
    
    def create(self, request):
        """Create a new league."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        league = serializer.save()
        return Response(
            league, 
            status=201
        )


class LeaguePlayerViewSet(ModelViewSet):
    queryset = LeaguePlayer.objects.all()
    serializer_class = LeaguePlayerSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permissions_classes = [AllowAny]
        else:
            permissions_classes = [permissions.IsLeagueAdmin | permissions.IsTournamentAdmin]
        
        return [permission() for permission in permissions_classes]
    
    def list(self, request, *args, **kwargs):
        """List all players in a league."""
        league_id = self.kwargs.get('league_pk')
        
        if not league_id:
            return Response({"detail": "League ID is required."}, status=400)
        
        queryset = self.queryset.filter(league__id=league_id)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
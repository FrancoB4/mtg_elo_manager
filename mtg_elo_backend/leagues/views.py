from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .serializers import LeagueSerializer
from .models import League
from rest_framework.response import Response

# Create your views here.
class LeagueViewSet(ModelViewSet):
    queryset = League.objects.all()
    serializer_class = LeagueSerializer
    
    def create(self, request):
        """Create a new league."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        league = serializer.save()
        return Response(
            league, 
            status=201
        )
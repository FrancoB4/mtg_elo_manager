from django.shortcuts import render
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.response import Response

from .models import CustomUser
from .serializers import CustomUserCreateSerializer, CustomUserSimpleSerializer
from apps.players.models import Player

# Create your views here.
class CreateUserView(APIView):
    """
    View to create a new user.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomUserCreateSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user_serializer = CustomUserSimpleSerializer(user)
            return Response(user_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class UserDetailView(RetrieveUpdateAPIView):
    """
    A viewset for viewing and editing user instances.
    """
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSimpleSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'username'
    lookup_url_kwarg = 'username'
    
    def retrieve(self, request, *args, **kwargs):
        username = request.data.get('username', None)
        if username:
            player = Player.objects.filter(user=request.user).first()
            if player:
                player.name = username
                player.save()
        return super().retrieve(request, *args, **kwargs)
        
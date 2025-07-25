from django.shortcuts import render
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.users.serializers import CustomUserCreateSerializer, CustomUserSimpleSerializer

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
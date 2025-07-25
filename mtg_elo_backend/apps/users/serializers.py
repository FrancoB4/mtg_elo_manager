from rest_framework import serializers

from apps.users.models import CustomUser


class CustomUserSimpleSerializer(serializers.ModelSerializer):
    """
    Serializer for a simple representation of the CustomUser model.
    This serializer is used to return basic user information without sensitive data.
    """
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_active')
        read_only_fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_active')
        

class CustomUserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new CustomUser.
    This serializer includes fields necessary for user creation.
    """
    
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
from rest_framework import serializers
from .models import Player


class PlayerSerializer(serializers.ModelSerializer):
    """
    Serializer for Player model.
    """
    class Meta:
        model = Player
        fields = ('id', 'name', 'rating', 'last_tendency', 'rd', 'sigma')
        read_only_fields = ('id', 'rating', 'last_tendency', 'rd', 'sigma')
from rest_framework import serializers
from .models import Player


class PlayerSerializer(serializers.ModelSerializer):
    """
    Serializer for Player model.
    """
    class Meta:
        model = Player
        fields = ('id', 'name', 'rating', 'last_tendency', 'rd', 'sigma', 'matches_won', 'matches_drawn', 'matches_lost')
        read_only_fields = ('id', 'rating', 'last_tendency', 'rd', 'sigma', 'matches_won', 'matches_drawn', 'matches_lost')


class FeaturedPlayerSerializer(serializers.Serializer):
    """
    Serializer para información de jugador destacado.
    """
    name = serializers.CharField()
    rating = serializers.FloatField()
    matches_played = serializers.IntegerField()


class GlobalPlayerStatisticsSerializer(serializers.Serializer):
    """
    Serializer for global player statistics.
    """
    
    total_players = serializers.IntegerField()
    total_tournaments = serializers.IntegerField()
    total_matches = serializers.IntegerField()
    average_rating = serializers.FloatField()
    most_active_player = FeaturedPlayerSerializer()
    highest_rated_player = FeaturedPlayerSerializer()
    lowest_rated_player = FeaturedPlayerSerializer()

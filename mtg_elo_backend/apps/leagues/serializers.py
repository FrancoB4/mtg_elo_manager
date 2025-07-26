from rest_framework import serializers
from .models import League, LeaguePlayer


class LeagueSerializer(serializers.ModelSerializer):
    """Serializer for the League model."""
    
    class Meta:
        model = League
        fields = ['id', 'name', 'description', 'start_date', 'end_date']
        
        
class LeaguePlayerSerializer(serializers.ModelSerializer):
    """Serializer for the LeaguePlayer model."""
    name = serializers.CharField(source='player.name', read_only=True)

    class Meta:
        model = LeaguePlayer
        fields = ['league', 'player', 'name', 'rating', 'matches_played', 'matches_won', 'matches_lost', 'last_tendency', 'matches_drawn']
        read_only_fields = ['league', 'player']
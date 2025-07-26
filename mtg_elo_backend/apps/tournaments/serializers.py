from rest_framework import serializers

from .models import Match, Tournament, TournamentPlayer


class TournamentSerializer(serializers.ModelSerializer):
    """
    Serializer for Tournament model.
    """
    class Meta:
        model = Tournament
        fields = ('id', 'name', 'date')
        read_only_fields = ('id',)


class TournamentPlayerSerializer(serializers.ModelSerializer):
    """
    Serializer for TournamentPlayer model.
    """
    name = serializers.CharField(source='player.name', read_only=True)
    
    
    class Meta:
        model = TournamentPlayer
        fields = ('id', 'player', 'name', 'rating', 'rd', 'matches_won', 'matches_drawn', 'matches_lost')
        read_only_fields = ('id', 'rating', 'player', 'rd', 'name')


class MatchSerializer(serializers.ModelSerializer):
    """
    Serializer for Match model.
    """
    class Meta:
        model = Match
        fields = ('id', 'round', 'player1', 'player2', 'winner', 'player1_score', 'player2_score')
        read_only_fields = ('id', 'round', 'winner')

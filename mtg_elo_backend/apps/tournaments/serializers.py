from rest_framework import serializers

from .models import Match, Round, Tournament, TournamentPlayer
from ..players.serializers import PlayerSerializer


class TournamentSerializer(serializers.ModelSerializer):
    """
    Serializer for Tournament model.
    """

    class Meta:
        model = Tournament
        fields = ('id', 'name', 'date', 'state', 'league')
        read_only_fields = ('id',)


class TournamentPlayerSerializer(serializers.ModelSerializer):
    """
    Serializer for TournamentPlayer model.
    """
    name = serializers.CharField(source='player.name', read_only=True)
    
    
    class Meta:
        model = TournamentPlayer
        fields = ('id', 'name', 'rating', 'rd', 'matches_won', 'matches_drawn', 'matches_lost')
        read_only_fields = ('id', 'rating', 'player', 'rd', 'name')


class RoundSerializer(serializers.ModelSerializer):
    """
    Serializer for Round model.
    """
    class Meta:
        model = Round
        fields = ('id', 'number', 'tournament')
        read_only_fields = ('id', 'number', 'tournament')


class MatchSerializer(serializers.ModelSerializer):
    """
    Serializer for Match model.
    """
    player_1 = PlayerSerializer(read_only=True, source='player1')
    player_2 = PlayerSerializer(read_only=True, source='player2')
    round_data = RoundSerializer(read_only=True, source='round')
    
    class Meta:
        model = Match
        fields = ('id', 'round_data', 'player_1', 'player_2', 'winner', 'player1_score', 'player2_score')
        read_only_fields = ('id', 'winner')

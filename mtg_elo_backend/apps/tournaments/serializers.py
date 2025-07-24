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
    class Meta:
        model = TournamentPlayer
        fields = ('id', 'tournament', 'player', 'rating')
        read_only_fields = ('id', 'rating')


class MatchSerializer(serializers.ModelSerializer):
    """
    Serializer for Match model.
    """
    class Meta:
        model = Match
        fields = ('id', 'round', 'player1', 'player2', 'winner', 'player1_score', 'player2_score')
        read_only_fields = ('id', 'round', 'winner')

from rest_framework import serializers
from .models import League


class LeagueSerializer(serializers.ModelSerializer):
    """Serializer for the League model."""
    
    class Meta:
        model = League
        fields = ['id', 'name', 'description', 'start_date', 'end_date']
        
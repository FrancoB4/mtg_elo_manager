# Guía Completa: Serializers Anidados en Django REST Framework

## 1. Serializer Anidado (Nested Serializer)

### Para un objeto único:
```python
class DireccionSerializer(serializers.Serializer):
    calle = serializers.CharField()
    ciudad = serializers.CharField()
    codigo_postal = serializers.CharField()

class PersonaSerializer(serializers.Serializer):
    nombre = serializers.CharField()
    direccion = DireccionSerializer()  # Un objeto anidado
```

### Para una lista de objetos:
```python
class PersonaSerializer(serializers.Serializer):
    nombre = serializers.CharField()
    direcciones = DireccionSerializer(many=True)  # Lista de objetos
```

## 2. DictField - Para diccionarios simples

### Diccionario con cualquier tipo de valor:
```python
class MySerializer(serializers.Serializer):
    metadata = serializers.DictField()
```

### Diccionario con valores tipados:
```python
class MySerializer(serializers.Serializer):
    # Diccionario donde todos los valores son strings
    config = serializers.DictField(child=serializers.CharField())
    
    # Diccionario donde todos los valores son enteros
    counters = serializers.DictField(child=serializers.IntegerField())
```

## 3. JSONField - Para estructuras complejas

```python
class MySerializer(serializers.Serializer):
    complex_data = serializers.JSONField()
```

## 4. Ejemplo Completo Real

```python
# serializers.py
from rest_framework import serializers

class PlayerStatsSerializer(serializers.Serializer):
    wins = serializers.IntegerField()
    losses = serializers.IntegerField()
    draws = serializers.IntegerField()
    win_rate = serializers.FloatField()

class DeckStatsSerializer(serializers.Serializer):
    deck_name = serializers.CharField()
    games_played = serializers.IntegerField()
    win_rate = serializers.FloatField()

class GlobalPlayerStatisticsSerializer(serializers.Serializer):
    # Campos simples
    total_players = serializers.IntegerField()
    average_rating = serializers.FloatField()
    
    # Objeto anidado
    overall_stats = PlayerStatsSerializer()
    
    # Lista de objetos anidados
    deck_performance = DeckStatsSerializer(many=True)
    
    # Diccionario simple
    metadata = serializers.DictField(child=serializers.CharField())
    
    # Estructura compleja con JSONField
    advanced_analytics = serializers.JSONField()

# En tu vista:
class GlobalPlayerStatisticsView(generics.GenericAPIView):
    def get(self, request):
        data = {
            'total_players': 150,
            'average_rating': 1456.7,
            
            # Objeto anidado
            'overall_stats': {
                'wins': 2345,
                'losses': 1876,
                'draws': 234,
                'win_rate': 55.6
            },
            
            # Lista de objetos anidados
            'deck_performance': [
                {
                    'deck_name': 'Aggro Red',
                    'games_played': 450,
                    'win_rate': 62.3
                },
                {
                    'deck_name': 'Control Blue',
                    'games_played': 380,
                    'win_rate': 58.7
                }
            ],
            
            # Diccionario simple
            'metadata': {
                'last_updated': '2025-01-15',
                'version': '1.0',
                'source': 'tournament_db'
            },
            
            # Estructura compleja
            'advanced_analytics': {
                'trends': {
                    'rating_increase': 12.5,
                    'activity_increase': 8.3
                },
                'predictions': {
                    'next_month_players': 175,
                    'growth_rate': 16.7
                },
                'regional_data': [
                    {'region': 'North', 'players': 45, 'avg_rating': 1520},
                    {'region': 'South', 'players': 38, 'avg_rating': 1445}
                ]
            }
        }
        
        serializer = GlobalPlayerStatisticsSerializer(data)
        return Response(serializer.data)
```

## 5. Resultado JSON Esperado

```json
{
    "total_players": 150,
    "average_rating": 1456.7,
    "overall_stats": {
        "wins": 2345,
        "losses": 1876,
        "draws": 234,
        "win_rate": 55.6
    },
    "deck_performance": [
        {
            "deck_name": "Aggro Red",
            "games_played": 450,
            "win_rate": 62.3
        },
        {
            "deck_name": "Control Blue",
            "games_played": 380,
            "win_rate": 58.7
        }
    ],
    "metadata": {
        "last_updated": "2025-01-15",
        "version": "1.0",
        "source": "tournament_db"
    },
    "advanced_analytics": {
        "trends": {
            "rating_increase": 12.5,
            "activity_increase": 8.3
        },
        "predictions": {
            "next_month_players": 175,
            "growth_rate": 16.7
        },
        "regional_data": [
            {
                "region": "North",
                "players": 45,
                "avg_rating": 1520
            },
            {
                "region": "South",
                "players": 38,
                "avg_rating": 1445
            }
        ]
    }
}
```

## 6. Consideraciones Importantes

### Validación:
- Los serializers anidados también validan automáticamente
- Puedes agregar validación personalizada con `validate_<field_name>()`

### Performance:
- Los serializers anidados no hacen queries adicionales automáticamente
- Los datos deben estar ya disponibles en tu vista

### Flexibilidad:
- `DictField`: Para diccionarios simples con estructura conocida
- `JSONField`: Para estructuras complejas y flexibles
- `Nested Serializers`: Para objetos con validación específica

## 7. Cuándo usar cada uno:

- **Nested Serializers**: Cuando necesitas validación estricta y estructura fija
- **DictField**: Para diccionarios simples con valores del mismo tipo
- **JSONField**: Para datos complejos, flexibles o que cambien frecuentemente

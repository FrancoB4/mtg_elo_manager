# MTG Elo Manager

Este es un sistema de gestión de clasificación para jugadores de Magic: The Gathering (MTG) implementado en Django. El sistema utiliza el algoritmo Glicko-2 para calcular y actualizar las clasificaciones de los jugadores basándose en los resultados de sus partidas.

## Características Principales

- Sistema de clasificación Glicko-2
- Seguimiento de torneos y partidas
- Gestión de estadísticas de jugadores
- Exportación de datos en formato CSV
- Interfaz de línea de comandos para gestión

## Modelos de Datos

### Player (Jugador)
- **name**: Nombre único del jugador
- **rating**: Puntuación Elo del jugador (valor por defecto: 1500)
- **rd**: Rating Deviation - Desviación de la clasificación (valor por defecto: 350)
- **sigma**: Volatilidad del rating (valor por defecto: 0.06)
- **matches_played**: Número total de partidas jugadas
- **matches_won**: Número de partidas ganadas
- **matches_drawn**: Número de partidas empatadas
- **matches_lost**: Número de partidas perdidas

### Tournament (Torneo)
- **name**: Nombre único del torneo
- **date**: Fecha del torneo
- **players**: Jugadores participantes
- **winner**: Ganador del torneo

### TournamentRating (Clasificación en Torneo)
- **tournament**: Referencia al torneo
- **player**: Referencia al jugador
- **rating**: Clasificación del jugador en el torneo
- **rd**: Rating Deviation en el torneo

## API Documentation

La siguiente documentación describe los endpoints necesarios para implementar el frontend de la aplicación. Esta API permitirá crear una experiencia similar a MTGGoldfish pero enfocada en nuestra comunidad local.

### Autenticación

#### Login
```http
POST /api/auth/login
```
**Body**:
```json
{
    "username": "string",
    "password": "string"
}
```
**Response**: `200 OK`
```json
{
    "token": "string",
    "user": {
        "id": "integer",
        "username": "string",
        "email": "string"
    }
}
```

#### Registro
```http
POST /api/auth/register
```
**Body**:
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```
**Response**: `201 Created`
```json
{
    "id": "integer",
    "username": "string",
    "email": "string"
}
```

### Jugadores

#### Listar Jugadores
```http
GET /api/players/
```
**Query Parameters**:
- `page`: número de página
- `limit`: resultados por página
- `sort`: campo de ordenamiento
- `order`: asc/desc

**Response**: `200 OK`
```json
{
    "count": "integer",
    "next": "string",
    "previous": "string",
    "results": [
        {
            "id": "integer",
            "name": "string",
            "rating": "integer",
            "rd": "float",
            "matches_played": "integer",
            "matches_won": "integer",
            "matches_drawn": "integer",
            "matches_lost": "integer",
            "win_rate": "float"
        }
    ]
}
```

#### Detalles de Jugador
```http
GET /api/players/{id}/
```
**Response**: `200 OK`
```json
{
    "id": "integer",
    "name": "string",
    "rating": "integer",
    "rd": "float",
    "sigma": "float",
    "matches_played": "integer",
    "matches_won": "integer",
    "matches_drawn": "integer",
    "matches_lost": "integer",
    "tournaments_played": "integer",
    "tournaments_won": "integer",
    "recent_matches": [
        {
            "tournament": "string",
            "opponent": "string",
            "result": "string",
            "rating_change": "integer",
            "date": "string"
        }
    ]
}
```

#### Historial de Jugador
```http
GET /api/players/{id}/history/
```
**Query Parameters**:
- `from_date`: fecha inicio
- `to_date`: fecha fin

**Response**: `200 OK`
```json
{
    "rating_history": [
        {
            "date": "string",
            "rating": "integer",
            "rd": "float"
        }
    ],
    "tournament_results": [
        {
            "tournament": "string",
            "position": "integer",
            "matches_won": "integer",
            "matches_lost": "integer",
            "rating_change": "integer"
        }
    ]
}
```

### Torneos

#### Listar Torneos
```http
GET /api/tournaments/
```
**Query Parameters**:
- `page`: número de página
- `limit`: resultados por página
- `status`: upcoming/ongoing/finished

**Response**: `200 OK`
```json
{
    "count": "integer",
    "next": "string",
    "previous": "string",
    "results": [
        {
            "id": "integer",
            "name": "string",
            "date": "string",
            "status": "string",
            "player_count": "integer",
            "winner": {
                "id": "integer",
                "name": "string"
            }
        }
    ]
}
```

#### Crear Torneo
```http
POST /api/tournaments/
```
**Body**:
```json
{
    "name": "string",
    "date": "string",
    "players": ["integer"]
}
```
**Response**: `201 Created`
```json
{
    "id": "integer",
    "name": "string",
    "date": "string",
    "players": [
        {
            "id": "integer",
            "name": "string",
            "initial_rating": "integer"
        }
    ]
}
```

#### Detalles de Torneo
```http
GET /api/tournaments/{id}/
```
**Response**: `200 OK`
```json
{
    "id": "integer",
    "name": "string",
    "date": "string",
    "status": "string",
    "players": [
        {
            "id": "integer",
            "name": "string",
            "initial_rating": "integer",
            "final_rating": "integer",
            "matches_won": "integer",
            "matches_lost": "integer"
        }
    ],
    "matches": [
        {
            "id": "integer",
            "player1": {
                "id": "integer",
                "name": "string"
            },
            "player2": {
                "id": "integer",
                "name": "string"
            },
            "result": "string",
            "round": "integer"
        }
    ]
}
```

#### Registrar Partida
```http
POST /api/tournaments/{id}/matches/
```
**Body**:
```json
{
    "player1_id": "integer",
    "player2_id": "integer",
    "result": "string", // "2-0", "2-1", "1-1", "0-2", "1-2"
    "round": "integer"
}
```
**Response**: `201 Created`
```json
{
    "id": "integer",
    "player1": {
        "id": "integer",
        "name": "string",
        "new_rating": "integer"
    },
    "player2": {
        "id": "integer",
        "name": "string",
        "new_rating": "integer"
    },
    "result": "string",
    "round": "integer"
}
```

### Estadísticas

#### Top Jugadores
```http
GET /api/stats/top-players/
```
**Query Parameters**:
- `limit`: número de jugadores (default: 10)
- `period`: all/month/year

**Response**: `200 OK`
```json
{
    "results": [
        {
            "id": "integer",
            "name": "string",
            "rating": "integer",
            "matches_played": "integer",
            "win_rate": "float",
            "tournaments_won": "integer"
        }
    ]
}
```

#### Estadísticas Generales
```http
GET /api/stats/general/
```
**Response**: `200 OK`
```json
{
    "total_players": "integer",
    "total_tournaments": "integer",
    "total_matches": "integer",
    "average_rating": "float",
    "most_active_players": [
        {
            "id": "integer",
            "name": "string",
            "matches_played": "integer"
        }
    ],
    "highest_winrates": [
        {
            "id": "integer",
            "name": "string",
            "win_rate": "float"
        }
    ]
}
```

## Servicios

### Glicko2Service
Implementa el algoritmo Glicko-2 para actualizar las clasificaciones de los jugadores. Características principales:
- Cálculo de clasificaciones 1vs1
- Soporte para partidas al mejor de 3 (Bo3)
- Gestión de torneos completos
- Cálculo de calidad de emparejamientos

### ExportService
Maneja la exportación de datos:
- Exportación a CSV
- Visualización en formato tabla
- Soporte para exportar top 10 de jugadores

### ImportService
Gestiona la importación de datos de torneos:
- Importación desde archivos CSV
- Parsing de resultados de partidas Bo3

## Comandos de Gestión

### show_table
Muestra la tabla de clasificación actual:
```bash
python manage.py show_table [--top-ten]
```

### export_csv
Exporta la clasificación a un archivo CSV:
```bash
python manage.py export_csv [--top-ten]
```

### rate_tournament
Procesa y calcula las clasificaciones de un torneo:
```bash
python manage.py rate_tournament <archivo_csv> [--export]
```

## Formato del Archivo CSV de Torneo

El archivo CSV debe tener el siguiente formato:
```
Jugador1,Resultado,Jugador2
```

Donde el resultado puede ser:
- "2-0": Victoria 2-0
- "2-1": Victoria 2-1
- "1-1": Empate
- "0-2": Derrota 0-2
- "1-2": Derrota 1-2
- "0-0": No jugado

## Configuración del Sistema

Los valores por defecto del sistema son:
- Rating inicial: 1500
- RD inicial: 350
- Sigma: 0.06
- Tau: 0.5
- Epsilon: 0.000001

## Instalación y Configuración

1. Clonar el repositorio
2. Crear un entorno virtual de Python
3. Instalar las dependencias:
```bash
pip install -r requirements.txt
```
4. Aplicar las migraciones:
```bash
python manage.py migrate
```

## Uso del Sistema

1. Crear un archivo CSV con los resultados del torneo
2. Colocar el archivo en la carpeta `imports/`
3. Ejecutar el comando de procesamiento del torneo:
```bash
python manage.py rate_tournament nombre_archivo.csv --export
```
4. Los resultados se exportarán a la carpeta `exports/`

## Estructura de Directorios

```
mtg_elo_manager/
├── manage.py
├── mtg_elo_manager/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── persistence_manager/
    ├── models.py
    ├── services/
    │   ├── glicko2_service.py
    │   ├── export_service.py
    │   └── import_service.py
    └── management/
        └── commands/
            ├── show_table.py
            ├── export_csv.py
            └── rate_tournament.py
``` 
# MTG Elo Manager - API Documentation

## Base URL
```
http://localhost:8000/
```

## Authentication
- **Public endpoints**: No authentication required
- **Protected endpoints**: Require authentication token
- **Admin endpoints**: Require Tournament Admin or League Admin permissions

---

## Players API

### Base URL: `/players/`

#### 1. List Players
```http
GET /players/
```
**Description**: Get a list of all players

**Permissions**: Public (AllowAny)

**Response**: `200 OK`
```json
[
    {
        "id": 1,
        "name": "Player Name",
        "rating": 1500,
        "rd": 350.0,
        "sigma": 0.06,
        "matches_played": 10,
        "matches_won": 7,
        "matches_drawn": 1,
        "matches_lost": 2,
        "last_tendency": 1
    }
]
```

#### 2. Get Player Details
```http
GET /players/{id}/
```
**Description**: Get details of a specific player

**Parameters**:
- `id` (path): Player ID

**Permissions**: Public (AllowAny)

**Response**: `200 OK`
```json
{
    "id": 1,
    "name": "Player Name",
    "rating": 1500,
    "rd": 350.0,
    "sigma": 0.06,
    "matches_played": 10,
    "matches_won": 7,
    "matches_drawn": 1,
    "matches_lost": 2,
    "last_tendency": 1
}
```

#### 3. Create Player
```http
POST /players/
```
**Description**: Create a new player

**Permissions**: Authenticated users

**Request Body**:
```json
{
    "name": "New Player Name"
}
```

**Response**: `201 Created`
```json
{
    "id": 2,
    "name": "New Player Name",
    "rating": 1500,
    "rd": 350.0,
    "sigma": 0.06,
    "matches_played": 0,
    "matches_won": 0,
    "matches_drawn": 0,
    "matches_lost": 0,
    "last_tendency": 0
}
```

#### 4. Update Player
```http
PUT /players/{id}/
PATCH /players/{id}/
```
**Description**: Update player information

**Parameters**:
- `id` (path): Player ID

**Permissions**: Authenticated users

**Request Body** (example):
```json
{
    "name": "Updated Player Name"
}
```

**Response**: `200 OK`

#### 5. Delete Player
```http
DELETE /players/{id}/
```
**Description**: Delete a player

**Parameters**:
- `id` (path): Player ID

**Permissions**: League Admin or Tournament Admin

**Response**: `204 No Content`

#### 6. Get Player Matches
```http
GET /players/{player_id}/matches/
```
**Description**: Get all matches for a specific player

**Parameters**:
- `player_id` (path): Player ID
- `tournament_id` (query, optional): Filter by tournament ID

**Permissions**: Public (AllowAny)

**Response**: `200 OK`
```json
[
    {
        "id": 1,
        "player1": {
            "id": 1,
            "name": "Player 1"
        },
        "player2": {
            "id": 2,
            "name": "Player 2"
        },
        "player1_score": 2,
        "player2_score": 1,
        "winner": {
            "id": 1,
            "name": "Player 1"
        },
        "round": {
            "number": 1,
            "tournament": "Tournament Name"
        }
    }
]
```

---

## Tournaments API

### Base URL: `/tournaments/`

#### 1. List Tournaments
```http
GET /tournaments/
```
**Description**: Get a list of all tournaments

**Query Parameters**:
- `league_id` (optional): Filter tournaments by league ID

**Permissions**: Public (AllowAny)

**Response**: `200 OK`
```json
[
    {
        "id": 1,
        "name": "Tournament Name",
        "date": "2025-07-24",
        "status": "ongoing",
        "players_count": 8,
        "winner": null
    }
]
```

#### 2. Get Tournament Details
```http
GET /tournaments/{id}/
```
**Description**: Get details of a specific tournament

**Parameters**:
- `id` (path): Tournament ID

**Permissions**: Public (AllowAny)

**Response**: `200 OK`
```json
{
    "id": 1,
    "name": "Tournament Name",
    "date": "2025-07-24",
    "status": "ongoing",
    "players": [
        {
            "id": 1,
            "name": "Player 1",
            "rating": 1520
        }
    ],
    "rounds": [
        {
            "number": 1,
            "matches_count": 4
        }
    ],
    "winner": null
}
```

#### 3. Create Tournament
```http
POST /tournaments/
```
**Description**: Create a new tournament

**Permissions**: Tournament Admin or League Admin

**Request Body**:
```json
{
    "name": "New Tournament",
    "date": "2025-07-25",
    "league_id": 1
}
```

**Response**: `201 Created`

#### 4. Update Tournament
```http
PUT /tournaments/{id}/
PATCH /tournaments/{id}/
```
**Description**: Update tournament information

**Parameters**:
- `id` (path): Tournament ID

**Permissions**: Tournament Admin or League Admin

**Response**: `200 OK`

#### 5. Delete Tournament
```http
DELETE /tournaments/{id}/
```
**Description**: Delete a tournament

**Parameters**:
- `id` (path): Tournament ID

**Permissions**: Tournament Admin or League Admin

**Response**: `204 No Content`

#### 6. End Tournament
```http
POST /tournaments/end/
```
**Description**: End a tournament, set winner, clean empty rounds, and export to CSV

**Parameters**:
- `tournament_id` (query): Tournament ID

**Permissions**: Tournament Admin or League Admin

**Response**: `200 OK`
```json
{
    "status": "Tournament ended successfully"
}
```

**Error Response**: `404 Not Found`
```json
{
    "error": "Tournament not found"
}
```

---

## Matches API

### Base URL: `/tournaments/{tournament_id}/matches/`

#### 1. List Tournament Matches
```http
GET /tournaments/{tournament_id}/matches/
```
**Description**: Get all matches in a tournament

**Parameters**:
- `tournament_id` (path): Tournament ID
- `player_id` (query, optional): Filter by player ID

**Permissions**: Public (AllowAny)

**Response**: `200 OK`
```json
[
    {
        "id": 1,
        "player1": {
            "id": 1,
            "name": "Player 1"
        },
        "player2": {
            "id": 2,
            "name": "Player 2"
        },
        "player1_score": 2,
        "player2_score": 1,
        "winner": {
            "id": 1,
            "name": "Player 1"
        },
        "round": {
            "number": 1,
            "tournament": "Tournament Name"
        }
    }
]
```

#### 2. Get Match Details
```http
GET /tournaments/{tournament_id}/matches/{id}/
```
**Description**: Get details of a specific match

**Parameters**:
- `tournament_id` (path): Tournament ID
- `id` (path): Match ID

**Permissions**: Public (AllowAny)

**Response**: `200 OK`

#### 3. Create Match
```http
POST /tournaments/{tournament_id}/matches/
```
**Description**: Create a new match in a tournament

**Parameters**:
- `tournament_id` (path): Tournament ID

**Permissions**: Authenticated users

**Request Body**:
```json
{
    "player1_id": 1,
    "player2_id": 2,
    "games": [1, 0, 1],
    "round_number": 1
}
```

**Games Format**:
- `1`: Player 1 wins the game
- `0`: Draw/tie
- `-1`: Player 2 wins the game
- `null`: Game not played

**Response**: `201 Created`
```json
{
    "status": "Match created successfully",
    "match": {
        "id": 1,
        "player1": {
            "id": 1,
            "name": "Player 1"
        },
        "player2": {
            "id": 2,
            "name": "Player 2"
        },
        "player1_score": 2,
        "player2_score": 1,
        "winner": {
            "id": 1,
            "name": "Player 1"
        }
    }
}
```

**Error Response**: `404 Not Found`
```json
{
    "error": "Tournament does not exist"
}
```

#### 4. Update Match
```http
PUT /tournaments/{tournament_id}/matches/{id}/
PATCH /tournaments/{tournament_id}/matches/{id}/
```
**Description**: Update match information

**Parameters**:
- `tournament_id` (path): Tournament ID
- `id` (path): Match ID

**Permissions**: Tournament Admin or League Admin

**Response**: `200 OK`

#### 5. Delete Match
```http
DELETE /tournaments/{tournament_id}/matches/{id}/
```
**Description**: Delete a match

**Parameters**:
- `tournament_id` (path): Tournament ID
- `id` (path): Match ID

**Permissions**: Tournament Admin or League Admin

**Response**: `204 No Content`

---

## Alternative Match Endpoints

### Get Matches by Player
```http
GET /players/{player_id}/matches/
```
**Description**: Get all matches for a specific player across all tournaments

**Parameters**:
- `player_id` (path): Player ID
- `tournament_id` (query, optional): Filter by specific tournament

**Permissions**: Public (AllowAny)

### Get Matches with Flexible Parameters
```http
GET /tournaments/{tournament_id}/matches/?player_id={player_id}
GET /players/{player_id}/matches/?tournament_id={tournament_id}
```
**Description**: Get matches with combined filters

**Parameters**:
- Either `tournament_id` or `player_id` must be provided (or both)
- If neither is provided, returns `400 Bad Request`

---

## Error Responses

### Common Error Codes

#### 400 Bad Request
```json
{
    "error": "Either tournament_id or player_id must be provided"
}
```

#### 401 Unauthorized
```json
{
    "detail": "Authentication credentials were not provided."
}
```

#### 403 Forbidden
```json
{
    "detail": "You do not have permission to perform this action."
}
```

#### 404 Not Found
```json
{
    "error": "Tournament not found"
}
```

#### 500 Internal Server Error
```json
{
    "error": "Internal server error message"
}
```

---

## Data Models

### Player
```json
{
    "id": "integer",
    "name": "string (max 35 chars, unique)",
    "rating": "integer (default: 1500)",
    "rd": "float (default: 350.0)",
    "sigma": "float (default: 0.06)",
    "matches_played": "integer (default: 0)",
    "matches_won": "integer (default: 0)",
    "matches_drawn": "integer (default: 0)",
    "matches_lost": "integer (default: 0)",
    "last_tendency": "integer (-2 to 2)"
}
```

### Tournament
```json
{
    "id": "integer",
    "name": "string",
    "date": "date",
    "status": "string",
    "players": ["array of players"],
    "winner": "player object or null"
}
```

### Match
```json
{
    "id": "integer",
    "player1": "player object",
    "player2": "player object",
    "player1_score": "integer",
    "player2_score": "integer",
    "winner": "player object or null",
    "round": "round object"
}
```

### Last Tendency Values
- `-2`: Big Down (↓)
- `-1`: Down (↘)
- `0`: Neutral (→)
- `1`: Up (↗)
- `2`: Big Up (↑)
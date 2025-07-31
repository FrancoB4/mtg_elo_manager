import Environment from '../config/environment';

// Interfaces para torneos
export interface Tournament {
  id: number;
  name: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  state?: 'PROGRAMMED' | 'STARTED' | 'FINISHED';
  max_players?: number;
  current_players?: number;
  format?: 'standard' | 'modern' | 'pioneer' | 'commander' | 'pauper' | 'draft' | 'sealed';
  entry_fee?: number;
  prize_pool?: number;
  location?: string;
  created_by?: {
    id: number;
    username: string;
  };
  winner?: {
    id: number;
    name: string;
    username: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface TournamentListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Tournament[];
}

export interface CreateTournamentData {
  name: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  max_players?: number;
  format: string;
  entry_fee?: number;
  prize_pool?: number;
  location?: string;
  league?: number;
  players?: number[];
}

export interface UpdateTournamentData extends Partial<CreateTournamentData> {
  status?: 'upcoming' | 'ongoing' | 'finished' | 'cancelled';
}

// Interface para los datos raw que vienen del API
export interface TournamentStandingRaw {
  id: number;
  name: string; // formato: "nombre_apellido"
  rating: number;
  rd: number;
  matches_won: number;
  matches_drawn: number;
  matches_lost: number;
}

// Interface para Standing procesado (clasificación)
export interface TournamentStanding {
  id: number;
  player: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  position: number;
  points: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  matches_drawn: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  win_percentage: number;
  opponents_win_percentage: number;
  games_win_percentage: number;
  rating: number;
  rd: number;
}

export interface TournamentStandingsResponse {
  count: number;
  results: TournamentStandingRaw[];
}

// Interfaces para Matches (datos raw del API)
export interface MatchRaw {
  id: number;
  round_data: {
    id: number;
    number: number;
    tournament: number;
  };
  player_1: {
    id: number;
    name: string;
    rating: number;
    last_tendency: number;
    rd: number;
    sigma: number;
    matches_won: number;
    matches_drawn: number;
    matches_lost: number;
  } | null;
  player_2: {
    id: number;
    name: string;
    rating: number;
    last_tendency: number;
    rd: number;
    sigma: number;
    matches_won: number;
    matches_drawn: number;
    matches_lost: number;
  } | null;
  winner?: number | null;
  player1_score: number;
  player2_score: number;
  table_number?: number;
  created_at?: string;
  updated_at?: string;
}

// Interfaces para Matches procesados (con datos de jugadores)
export interface Match {
  id: number;
  round: number;
  table_number?: number;
  player1: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  } | null;
  player2: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  } | null;
  result?: 'player1_win' | 'player2_win' | 'draw' | 'no_result';
  player1_games: number;
  player2_games: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TournamentMatchesResponse {
  count: number;
  results: Match[];
}

// Interfaces agrupadas por ronda
export interface RoundMatches {
  round: number;
  matches: Match[];
}

class TournamentService {
  private baseURL: string;

  constructor() {
    this.baseURL = Environment.apiUrl;
    
    if (Environment.debug) {
      console.log('TournamentService initialized with baseURL:', this.baseURL);
    }
  }

    /**
   * Obtener lista de torneos con filtros y paginación
   */
  async getTournaments(params?: {
    page?: number;
    status?: string;
    format?: string;
    search?: string;
    ordering?: string;
  }): Promise<TournamentListResponse | Tournament[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.format) queryParams.append('format', params.format);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.ordering) queryParams.append('ordering', params.ordering);

      const url = `${this.baseURL}/tournaments/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      if (Environment.debug) {
        console.log('Fetching tournaments from:', url);
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al obtener los torneos');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Tournaments fetched successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Get tournaments error:', error);
      throw error;
    }
  }

  /**
   * Obtener un torneo específico por ID
   */
  async getTournament(id: number): Promise<Tournament> {
    try {
      const response = await fetch(`${this.baseURL}/tournaments/${id}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al obtener el torneo');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Tournament fetched successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Get tournament error:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo torneo
   */
  async createTournament(tournamentData: CreateTournamentData): Promise<Tournament> {
    try {
      if (Environment.debug) {
        console.log('Creating tournament with data:', tournamentData);
      }

      const response = await fetch(`${this.baseURL}/tournaments/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tournamentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al crear el torneo');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Tournament created successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Create tournament error:', error);
      throw error;
    }
  }

  /**
   * Actualizar un torneo existente
   */
  async updateTournament(id: number, tournamentData: UpdateTournamentData): Promise<Tournament> {
    try {
      if (Environment.debug) {
        console.log('Updating tournament', id, 'with data:', tournamentData);
      }

      const response = await fetch(`${this.baseURL}/tournaments/${id}/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tournamentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al actualizar el torneo');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Tournament updated successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Update tournament error:', error);
      throw error;
    }
  }

  /**
   * Eliminar un torneo
   */
  async deleteTournament(id: number): Promise<void> {
    try {
      if (Environment.debug) {
        console.log('Deleting tournament:', id);
      }

      const response = await fetch(`${this.baseURL}/tournaments/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al eliminar el torneo');
      }

      if (Environment.debug) {
        console.log('Tournament deleted successfully');
      }
    } catch (error) {
      console.error('Delete tournament error:', error);
      throw error;
    }
  }

  /**
   * Inscribirse a un torneo
   */
  async joinTournament(id: number): Promise<{ message: string }> {
    try {
      if (Environment.debug) {
        console.log('Joining tournament:', id);
      }

      const response = await fetch(`${this.baseURL}/tournaments/${id}/join/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al inscribirse al torneo');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Joined tournament successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Join tournament error:', error);
      throw error;
    }
  }

  /**
   * Salirse de un torneo
   */
  async leaveTournament(id: number): Promise<{ message: string }> {
    try {
      if (Environment.debug) {
        console.log('Leaving tournament:', id);
      }

      const response = await fetch(`${this.baseURL}/tournaments/${id}/leave/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al salirse del torneo');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Left tournament successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Leave tournament error:', error);
      throw error;
    }
  }

  /**
   * Obtener standings de un torneo
   */
  async getTournamentStandings(tournamentId: number): Promise<TournamentStanding[]> {
    try {
      const url = `${this.baseURL}/tournaments/${tournamentId}/players`;
      
      if (Environment.debug) {
        console.log('Fetching tournament standings from:', url);
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al obtener standings');
      }

      const data: TournamentStandingsResponse = await response.json();
      
      if (Environment.debug) {
        console.log('Tournament standings loaded:', data);
      }

      // Procesar los datos raw del API y convertirlos al formato frontend
      const standings: TournamentStanding[] = data.results.map((rawStanding, index) => {
        // Parsear el nombre de usuario (formato: "nombre_apellido")
        const nameParts = rawStanding.name.split('_');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Calcular estadísticas
        const matchesPlayed = rawStanding.matches_won + rawStanding.matches_lost + rawStanding.matches_drawn;
        const points = (rawStanding.matches_won * 3) + (rawStanding.matches_drawn * 1);
        const winPercentage = matchesPlayed > 0 ? rawStanding.matches_won / matchesPlayed : 0;
        
        return {
          id: rawStanding.id,
          player: {
            id: rawStanding.id,
            username: rawStanding.name,
            first_name: firstName,
            last_name: lastName,
          },
          position: index + 1, // Posición basada en el orden del array (ya viene ordenado por rating)
          points: points,
          matches_played: matchesPlayed,
          matches_won: rawStanding.matches_won,
          matches_lost: rawStanding.matches_lost,
          matches_drawn: rawStanding.matches_drawn,
          games_won: 0, // No disponible en la respuesta actual
          games_lost: 0, // No disponible en la respuesta actual
          games_drawn: 0, // No disponible en la respuesta actual
          win_percentage: winPercentage,
          opponents_win_percentage: 0, // No disponible en la respuesta actual
          games_win_percentage: 0, // No disponible en la respuesta actual
          rating: rawStanding.rating,
          rd: rawStanding.rd,
        };
      });

      return standings;
    } catch (error) {
      console.error('Get tournament standings error:', error);
      throw error;
    }
  }

  /**
   * Obtener matches de un torneo
   */
  async getTournamentMatches(tournamentId: number): Promise<Match[]> {
    try {
      const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/matches`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al obtener matches');
      }

      const matchesData = await response.json();
      
      if (Environment.debug) {
        console.log('Tournament matches loaded:', matchesData);
      }

      // Extraer matches (puede ser array directo o paginado)
      const rawMatches: MatchRaw[] = Array.isArray(matchesData) ? matchesData : matchesData.results || [];
      
      // Procesar matches para incluir datos completos de jugadores
      const processedMatches: Match[] = rawMatches.map(match => {
        // Convertir los datos del jugador del API al formato esperado por el frontend
        const player1 = match.player_1 ? {
          id: match.player_1.id,
          username: match.player_1.name, // El API devuelve 'name' como username
          first_name: match.player_1.name.split('_')[0] || match.player_1.name, // Extraer first_name del name
          last_name: match.player_1.name.split('_')[1] || '', // Extraer last_name del name
        } : null;

        const player2 = match.player_2 ? {
          id: match.player_2.id,
          username: match.player_2.name,
          first_name: match.player_2.name.split('_')[0] || match.player_2.name,
          last_name: match.player_2.name.split('_')[1] || '',
        } : null;
        
        // Determinar el resultado basado en el winner
        let result: 'player1_win' | 'player2_win' | 'draw' | 'no_result' = 'no_result';
        if (match.winner === match.player_1?.id) {
          result = 'player1_win';
        } else if (match.winner === match.player_2?.id) {
          result = 'player2_win';
        } else if (match.player1_score > 0 || match.player2_score > 0) {
          // Si hay scores pero no winner, podría ser empate
          if (match.player1_score === match.player2_score) {
            result = 'draw';
          }
        }

        // Determinar el status
        let status: 'pending' | 'in_progress' | 'completed' = 'pending';
        if (match.winner || match.player1_score > 0 || match.player2_score > 0) {
          status = 'completed';
        }

        return {
          id: match.id,
          round: match.round_data.number,
          table_number: match.table_number,
          player1,
          player2,
          result,
          player1_games: match.player1_score,
          player2_games: match.player2_score,
          status,
          created_at: match.created_at || new Date().toISOString(),
          updated_at: match.updated_at || new Date().toISOString(),
        };
      });

      return processedMatches;
    } catch (error) {
      console.error('Get tournament matches error:', error);
      throw error;
    }
  }

  /**
   * Inscribirse a un torneo
   */
  async registerToTournament(tournamentId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al inscribirse al torneo');
      }

      if (Environment.debug) {
        console.log('Successfully registered to tournament:', tournamentId);
      }
    } catch (error) {
      console.error('Register to tournament error:', error);
      throw error;
    }
  }

  /**
   * Registrar un jugador específico en un torneo (usando endpoint players)
   */
  async registerPlayerToTournament(tournamentId: number, userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/players/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al registrar jugador en el torneo');
      }

      if (Environment.debug) {
        console.log('Successfully registered player to tournament:', { tournamentId, userId });
      }
    } catch (error) {
      console.error('Register player to tournament error:', error);
      throw error;
    }
  }

  /**
   * Obtener partidas pendientes del usuario actual
   */
  async getMyPendingMatches(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/matches/pending`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al obtener partidas pendientes');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Pending matches loaded:', data);
      }

      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('Get pending matches error:', error);
      throw error;
    }
  }

  /**
   * Reportar resultado de una partida
   */
  async reportMatchResult(matchId: number, result: {
    player_games: number;
    opponent_games: number;
  }): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/matches/${matchId}/result`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al reportar el resultado');
      }

      if (Environment.debug) {
        console.log('Match result reported successfully:', matchId, result);
      }
    } catch (error) {
      console.error('Report match result error:', error);
      throw error;
    }
  }

  /**
   * Obtener información completa de un torneo
   */
  async getTournamentDetail(tournamentId: number): Promise<Tournament> {
    try {
      const url = `${this.baseURL}/tournaments/${tournamentId}`;
      
      if (Environment.debug) {
        console.log('Fetching tournament detail from:', url);
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Error al obtener torneo');
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Tournament detail loaded:', data);
      }

      return data;
    } catch (error) {
      console.error('Get tournament detail error:', error);
      throw error;
    }
  }
}

const tournamentService = new TournamentService();
export default tournamentService;

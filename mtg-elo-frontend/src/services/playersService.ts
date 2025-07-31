import Environment from '../config/environment';
import type { Player, RankingFilters, PaginatedResponse } from '../types/players';

class PlayersService {
  private baseURL: string;

  constructor() {
    this.baseURL = Environment.fullApiUrl;
  }

  /**
   * Get player ranking based on filters
   */
  async getPlayerRanking(filters: RankingFilters): Promise<PaginatedResponse<Player>> {
    try {
      const params = new URLSearchParams();
      
      params.append('type', filters.type);
      params.append('page', filters.page.toString());
      params.append('page_size', filters.pageSize.toString());
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.tournamentName) {
        params.append('tournament_name', filters.tournamentName);  // Usar tournament_name en lugar de tournament_id
      }
      
      if (filters.leagueId) {
        params.append('league_id', filters.leagueId);
      }

      // Ordenamiento por rating descendente
      params.append('ordering', '-rating');

      const fetchUrl: string = filters.type === 'tournament'
        ? `${this.baseURL}/tournaments/${filters.tournamentName}/players/?${params.toString()}`
        : (filters.type === 'league'
          ? `${this.baseURL}/leagues/${filters.leagueId}/players/?${params.toString()}`
          : `${this.baseURL}/players/?${params.toString()}`);

      const response = await fetch(fetchUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching player ranking:', error);
      throw error;
    }
  }

  /**
   * Get single player details
   */
  async getPlayer(playerId: string): Promise<Player> {
    try {
      const response = await fetch(`${this.baseURL}/players/${playerId}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching player:', error);
      throw error;
    }
  }

  /**
   * Get tournaments for a league
   */
  async getLeagueTournaments(leagueId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/tournaments/?league=${leagueId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching league tournaments:', error);
      throw error;
    }
  }

  /**
   * Get tournament players (TournamentPlayer objects)
   */
  async getTournamentPlayers(tournamentId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/players/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching tournament players:', error);
      throw error;
    }
  }

}

export const playersService = new PlayersService();
export default playersService;
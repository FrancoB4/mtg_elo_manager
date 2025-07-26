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
    const endpoint = this.buildRankingEndpoint(filters);
    const params = this.buildQueryParams(filters);
    
    console.log(`Fetching players from: ${endpoint}?${params}`);

    try {
      const response = await fetch(`${endpoint}?${params}`, {
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
      
      // Handle different response formats
      let results: Player[] = [];
      
      if (filters.type === 'tournament') {
        // For tournament players, we get TournamentPlayer objects
        results = data.results ? data.results.map((tp: any) => ({
          id: tp.player?.id || tp.id,
          name: tp.player?.name || tp.name,
          rating: tp.rating || tp.player?.rating || 1500,
          rd: tp.player?.rd || 350,
          sigma: tp.player?.sigma || 0.06,
          matches_played: tp.player?.matches_played || 0,
          matches_won: tp.player?.matches_won || 0,
          matches_drawn: tp.player?.matches_drawn || 0,
          matches_lost: tp.player?.matches_lost || 0,
          last_tendency: tp.player?.last_tendency || 0,
        })) : data.map((tp: any) => ({
          id: tp.player?.id || tp.id,
          name: tp.player?.name || tp.name,
          rating: tp.rating || tp.player?.rating || 1500,
          rd: tp.player?.rd || 350,
          sigma: tp.player?.sigma || 0.06,
          matches_played: tp.player?.matches_played || 0,
          matches_won: tp.player?.matches_won || 0,
          matches_drawn: tp.player?.matches_drawn || 0,
          matches_lost: tp.player?.matches_lost || 0,
          last_tendency: tp.player?.last_tendency || 0,
        }));
      } else {
        // For global players, we get Player objects directly
        results = data.results || data;
      }

      return {
        results,
        count: data.count || data.length || 0,
        next: data.next || null,
        previous: data.previous || null,
      };
    } catch (error) {
      console.error('Error fetching player ranking:', error);
      throw error;
    }
  }

  /**
   * Get tournaments for a league
   */
  async getLeagueTournaments(leagueId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/tournaments/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ league_id: leagueId }),
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
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tournament_id: tournamentId }),
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
   * Build the appropriate endpoint based on ranking type
   */
  private buildRankingEndpoint(filters: RankingFilters): string {
    switch (filters.type) {
      case 'tournament':
        if (!filters.tournamentId) {
          throw new Error('Tournament ID is required for tournament ranking');
        }
        // Use the tournament players endpoint
        return `${this.baseURL}/tournaments/${filters.tournamentId}/players`;
      
      case 'league':
        if (!filters.leagueId) {
          throw new Error('League ID is required for league ranking');
        }
        // For league rankings, we'll need to aggregate tournament players
        // For now, return the players endpoint with league filter
        return `${this.baseURL}/players`;
      
      case 'global':
      default:
        return `${this.baseURL}/players`;
    }
  }

  /**
   * Build query parameters for the API request
   */
  private buildQueryParams(filters: RankingFilters): string {
    const params = new URLSearchParams();

    // Pagination
    if (filters.page > 1) {
      params.append('page', filters.page.toString());
    }
    if (filters.pageSize !== 20) {
      params.append('page_size', filters.pageSize.toString());
    }

    // Search
    if (filters.search) {
      params.append('search', filters.search);
    }

    // League filter for league rankings
    if (filters.type === 'league' && filters.leagueId) {
      params.append('league_id', filters.leagueId);
    }

    // Ordering (always by rating DESC)
    params.append('ordering', '-rating');

    return params.toString();
  }
}

export const playersService = new PlayersService();
export default playersService;
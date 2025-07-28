import Environment from '../config/environment';

export interface GlobalStatistics {
  total_players: number;
  total_tournaments: number | null;
  total_matches: number;
  average_rating: number;
  most_active_player: {
    name: string | null;
    rating: number | null;
    matches_played: number | null;
  };
  highest_rated_player: {
    name: string;
    rating: number;
    matches_played: number;
  };
  lowest_rated_player: {
    name: string;
    rating: number;
    matches_played: number;
  };
}

class StatisticsService {
  private baseURL: string;

  constructor() {
    this.baseURL = Environment.fullApiUrl;
  }

  async getGlobalStatistics(): Promise<GlobalStatistics> {
    try {
      if (Environment.debug) {
        console.log('Fetching global statistics from:', `${this.baseURL}/players/statistics/`);
      }

      const response = await fetch(`${this.baseURL}/players/statistics/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Global statistics received:', data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching global statistics:', error);
      throw error;
    }
  }

  async getLeagueStatistics(league_id: number): Promise<GlobalStatistics> {
    try {
      if (Environment.debug) {
        console.log('Fetching league statistics from:', `${this.baseURL}/players/statistics/?league_id=${league_id}`);
      }

      const response = await fetch(`${this.baseURL}/players/statistics/?league_id=${league_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Global statistics received:', data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching global statistics:', error);
      throw error;
    }
  }

  async getTournamentStatistics(tournament_id: number): Promise<GlobalStatistics> {
    try {
      if (Environment.debug) {
        console.log('Fetching tournament statistics from:', `${this.baseURL}/players/statistics/?tournament_id=${tournament_id}`);
      }

      const response = await fetch(`${this.baseURL}/players/statistics/?tournament_id=${tournament_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (Environment.debug) {
        console.log('Global statistics received:', data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching global statistics:', error);
      throw error;
    }
  }
}

const statisticsService = new StatisticsService();
export default statisticsService;

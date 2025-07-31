import Environment from '../config/environment';

export interface League {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeagueListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: League[];
}

class LeagueService {
  private baseURL: string;

  constructor() {
    this.baseURL = Environment.fullApiUrl;
  }

  /**
   * Get all leagues
   */
  async getLeagues(): Promise<League[]> {
    try {
      const response = await fetch(`${this.baseURL}/leagues/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: LeagueListResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching leagues:', error);
      throw error;
    }
  }

  /**
   * Get active leagues only
   */
  async getActiveLeagues(): Promise<League[]> {
    try {
      const response = await fetch(`${this.baseURL}/leagues/?is_active=true`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: LeagueListResponse = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching active leagues:', error);
      throw error;
    }
  }
}

const leagueService = new LeagueService();
export default leagueService;

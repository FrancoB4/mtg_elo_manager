export interface Player {
  id?: number;
  name: string;
  rating: number;
  rd: number;
  sigma: number;
  matches_played: number;
  matches_won: number;
  matches_drawn: number;
  matches_lost: number;
  last_tendency: number;
}

export type RankingType = 'global' | 'tournament' | 'league';

export interface RankingFilters {
  type: RankingType;
  tournamentId?: string;
  leagueId?: string;
  page: number;
  pageSize: number;
  search: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
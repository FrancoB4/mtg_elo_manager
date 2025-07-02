export interface Player {
    id: number;
    name: string;
    rating: number;
    rd: number;
    matches_played: number;
    matches_won: number;
    matches_drawn: number;
    matches_lost: number;
    win_rate: number;
}

export interface Tournament {
    id: number;
    name: string;
    date: string;
    status: 'upcoming' | 'ongoing' | 'finished';
    player_count: number;
    winner?: {
        id: number;
        name: string;
    };
}

export interface Match {
    id: number;
    player1: {
        id: number;
        name: string;
        rating: number;
    };
    player2: {
        id: number;
        name: string;
        rating: number;
    };
    result: string;
    round: number;
}

export type MtgColor = 'W' | 'U' | 'B' | 'R' | 'G';

export interface Deck {
    id: number;
    name: string;
    format: 'standard' | 'modern' | 'pioneer' | 'commander' | 'pauper';
    colors: MtgColor[];
    player: {
        id: number;
        name: string;
    };
    wins: number;
    losses: number;
    tournaments_played: number;
    last_tournament_result?: string;
    archetype: string;
}

export interface GeneralStats {
    total_players: number;
    total_tournaments: number;
    total_matches: number;
    average_rating: number;
    most_active_players: {
        id: number;
        name: string;
        matches_played: number;
    }[];
    highest_winrates: {
        id: number;
        name: string;
        win_rate: number;
    }[];
} 
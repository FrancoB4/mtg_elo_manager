import { Player, Tournament, GeneralStats, Deck } from '../types';

export const mockPlayers: Player[] = [
    {
        id: 1,
        name: "Juan Pérez",
        rating: 1850,
        rd: 75,
        matches_played: 45,
        matches_won: 30,
        matches_drawn: 5,
        matches_lost: 10,
        win_rate: 0.67
    },
    {
        id: 2,
        name: "María García",
        rating: 1750,
        rd: 85,
        matches_played: 38,
        matches_won: 25,
        matches_drawn: 3,
        matches_lost: 10,
        win_rate: 0.66
    },
    {
        id: 3,
        name: "Carlos Rodríguez",
        rating: 1920,
        rd: 65,
        matches_played: 52,
        matches_won: 35,
        matches_drawn: 7,
        matches_lost: 10,
        win_rate: 0.67
    }
];

export const mockDecks: Deck[] = [
    {
        id: 1,
        name: "Izzet Phoenix",
        format: "modern",
        colors: ["U", "R"],
        player: {
            id: 1,
            name: "Juan Pérez"
        },
        wins: 25,
        losses: 15,
        tournaments_played: 8,
        last_tournament_result: "Top 4",
        archetype: "Combo-Control"
    },
    {
        id: 2,
        name: "Mono Green Tron",
        format: "modern",
        colors: ["G"],
        player: {
            id: 2,
            name: "María García"
        },
        wins: 20,
        losses: 18,
        tournaments_played: 6,
        last_tournament_result: "Top 8",
        archetype: "Big Mana"
    },
    {
        id: 3,
        name: "Rakdos Midrange",
        format: "pioneer",
        colors: ["B", "R"],
        player: {
            id: 3,
            name: "Carlos Rodríguez"
        },
        wins: 30,
        losses: 12,
        tournaments_played: 10,
        last_tournament_result: "1st Place",
        archetype: "Midrange"
    }
];

export const mockTournaments: Tournament[] = [
    {
        id: 1,
        name: "Torneo Local Junio 2025",
        date: "2025-06-15",
        status: "finished",
        player_count: 16,
        winner: {
            id: 3,
            name: "Carlos Rodríguez"
        }
    },
    {
        id: 2,
        name: "Campeonato Regional 2025",
        date: "2025-07-01",
        status: "ongoing",
        player_count: 32
    },
    {
        id: 3,
        name: "Torneo Clasificatorio Agosto",
        date: "2025-08-15",
        status: "upcoming",
        player_count: 24
    }
];

export const mockGeneralStats: GeneralStats = {
    total_players: 45,
    total_tournaments: 12,
    total_matches: 256,
    average_rating: 1650,
    most_active_players: [
        {
            id: 3,
            name: "Carlos Rodríguez",
            matches_played: 52
        },
        {
            id: 1,
            name: "Juan Pérez",
            matches_played: 45
        }
    ],
    highest_winrates: [
        {
            id: 3,
            name: "Carlos Rodríguez",
            win_rate: 0.67
        },
        {
            id: 1,
            name: "Juan Pérez",
            win_rate: 0.67
        }
    ]
}; 
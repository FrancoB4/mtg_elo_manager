import React from 'react';
import { PlayerCard } from '../components/PlayerCard';
import { TournamentCard } from '../components/TournamentCard';
import { StatsOverview } from '../components/StatsOverview';
import { DeckCard } from '../components/DeckCard';
import { mockPlayers, mockTournaments, mockGeneralStats, mockDecks } from '../data/mockData';

export const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">MTG Elo Manager</h1>

                {/* Stats Overview */}
                <div className="mb-12">
                    <StatsOverview stats={mockGeneralStats} />
                </div>

                {/* Top Players */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Top Jugadores</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockPlayers.map(player => (
                            <PlayerCard key={player.id} player={player} />
                        ))}
                    </div>
                </div>

                {/* Decks */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mazos Destacados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockDecks.map(deck => (
                            <DeckCard key={deck.id} deck={deck} />
                        ))}
                    </div>
                </div>

                {/* Recent Tournaments */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Torneos Recientes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockTournaments.map(tournament => (
                            <TournamentCard key={tournament.id} tournament={tournament} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}; 
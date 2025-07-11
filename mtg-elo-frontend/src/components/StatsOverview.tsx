import React from 'react';
import { GeneralStats } from '../types';

interface StatsOverviewProps {
    stats: GeneralStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Estadísticas Generales</h2>
            
            <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{stats.total_players}</p>
                    <p className="text-sm text-gray-500">Jugadores</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.total_tournaments}</p>
                    <p className="text-sm text-gray-500">Torneos</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{stats.total_matches}</p>
                    <p className="text-sm text-gray-500">Partidas</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">{stats.average_rating}</p>
                    <p className="text-sm text-gray-500">Rating Promedio</p>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Jugadores Más Activos</h3>
                <div className="space-y-3">
                    {stats.most_active_players.map(player => (
                        <div key={player.id} className="flex justify-between items-center">
                            <span className="text-gray-800">{player.name}</span>
                            <span className="text-gray-600">{player.matches_played} partidas</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Mejores Win Rates</h3>
                <div className="space-y-3">
                    {stats.highest_winrates.map(player => (
                        <div key={player.id} className="flex justify-between items-center">
                            <span className="text-gray-800">{player.name}</span>
                            <span className="text-gray-600">{(player.win_rate * 100).toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}; 
import React from 'react';
import { Tournament } from '../types';

interface TournamentCardProps {
    tournament: Tournament;
}

const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
        case 'upcoming':
            return 'bg-blue-100 text-blue-800';
        case 'ongoing':
            return 'bg-green-100 text-green-800';
        case 'finished':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
    const statusColor = getStatusColor(tournament.status);
    const formattedDate = new Date(tournament.date).toLocaleDateString();

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-800">{tournament.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    {tournament.status}
                </span>
            </div>
            
            <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fecha</span>
                    <span className="text-gray-900">{formattedDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Participantes</span>
                    <span className="text-gray-900">{tournament.player_count}</span>
                </div>
                {tournament.winner && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Ganador</span>
                        <span className="text-gray-900 font-medium">{tournament.winner.name}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Ver Detalles
                </button>
            </div>
        </div>
    );
}; 
import React from 'react';
import { Player } from '../types';

interface PlayerCardProps {
    player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800">{player.name}</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="text-lg font-medium text-gray-900">{player.rating}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Win Rate</p>
                    <p className="text-lg font-medium text-gray-900">{(player.win_rate * 100).toFixed(1)}%</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Matches</p>
                    <p className="text-lg font-medium text-gray-900">{player.matches_played}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">RD</p>
                    <p className="text-lg font-medium text-gray-900">{player.rd}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                    <span className="text-green-600">W: {player.matches_won}</span>
                    <span className="text-gray-500">D: {player.matches_drawn}</span>
                    <span className="text-red-600">L: {player.matches_lost}</span>
                </div>
            </div>
        </div>
    );
}; 
import React from 'react';
import { Deck } from '../types';

interface DeckCardProps {
    deck: Deck;
}

type MtgColor = 'W' | 'U' | 'B' | 'R' | 'G';

const colorClasses: Record<MtgColor, string> = {
    'W': 'bg-yellow-100 text-yellow-800',
    'U': 'bg-blue-100 text-blue-800',
    'B': 'bg-gray-800 text-white',
    'R': 'bg-red-100 text-red-800',
    'G': 'bg-green-100 text-green-800'
};

const getColorIcon = (color: MtgColor) => {
    return (
        <span className={`inline-block w-6 h-6 rounded-full ${colorClasses[color]} text-center font-bold mr-1`}>
            {color}
        </span>
    );
};

export const DeckCard: React.FC<DeckCardProps> = ({ deck }) => {
    const winRate = ((deck.wins / (deck.wins + deck.losses)) * 100).toFixed(1);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">{deck.name}</h3>
                    <p className="text-sm text-gray-500">{deck.archetype}</p>
                </div>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    {deck.format}
                </span>
            </div>

            <div className="mb-4">
                <div className="flex space-x-1">
                    {deck.colors.map((color, index) => (
                        <span key={index}>{getColorIcon(color as MtgColor)}</span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-sm text-gray-500">Win Rate</p>
                    <p className="text-lg font-medium text-gray-900">{winRate}%</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Torneos</p>
                    <p className="text-lg font-medium text-gray-900">{deck.tournaments_played}</p>
                </div>
            </div>

            <div className="flex justify-between text-sm">
                <span className="text-green-600">W: {deck.wins}</span>
                <span className="text-red-600">L: {deck.losses}</span>
            </div>

            {deck.last_tournament_result && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Último resultado</p>
                    <p className="text-base font-medium text-gray-900">{deck.last_tournament_result}</p>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Piloto</p>
                <p className="text-base font-medium text-gray-900">{deck.player.name}</p>
            </div>
        </div>
    );
}; 
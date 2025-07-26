import React from 'react';
import { Link } from 'react-router-dom';
import type { Player } from '../../../types/players';

interface PlayerCardProps {
  player: Player;
  rank: number;
  showDetails?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  rank, 
  showDetails = true 
}) => {
  const getTendencyIcon = (tendency: number) => {
    switch (tendency) {
      case 2: return { icon: '⬆️', color: 'text-green-600', bg: 'bg-green-100' };
      case 1: return { icon: '↗️', color: 'text-green-500', bg: 'bg-green-50' };
      case 0: return { icon: '➡️', color: 'text-gray-500', bg: 'bg-gray-100' };
      case -1: return { icon: '↘️', color: 'text-red-500', bg: 'bg-red-50' };
      case -2: return { icon: '⬇️', color: 'text-red-600', bg: 'bg-red-100' };
      default: return { icon: '➡️', color: 'text-gray-500', bg: 'bg-gray-100' };
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2000) return 'text-purple-600 font-bold';
    if (rating >= 1800) return 'text-blue-600 font-semibold';
    if (rating >= 1600) return 'text-green-600 font-semibold';
    if (rating >= 1400) return 'text-yellow-600 font-medium';
    return 'text-gray-600';
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const tendency = getTendencyIcon(player.last_tendency);
  const totalMatches = player.matches_won + player.matches_drawn + player.matches_lost;
  const winRate = totalMatches > 0 
    ? ((player.matches_won / totalMatches) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Rank and Player Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Rank */}
            <div className="flex-shrink-0">
              <div className="text-lg font-bold text-gray-800 min-w-[50px] text-center">
                {getRankDisplay(rank)}
              </div>
            </div>

            {/* Player Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Link 
                  to={`/players/${player.id}`}
                  className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate"
                >
                  {player.name}
                </Link>
                
                {/* Tendency */}
                <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${tendency.bg} ${tendency.color}`}>
                  {tendency.icon}
                </div>
              </div>

              {/* Stats Summary - More compact */}
              <div className="mt-1 flex items-center space-x-3 text-xs text-gray-600">
                <span className="flex items-center space-x-1">
                  <span className="font-medium">{totalMatches}</span>
                  <span>partidas</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <span className="font-medium text-green-600">{winRate}%</span>
                  <span>victorias</span>
                </span>
                <span>•</span>
                <span className="font-medium">
                  {player.matches_won}V-{player.matches_drawn}E-{player.matches_lost}D
                </span>
                {showDetails && (
                  <>
                    <span>•</span>
                    <span>
                      RD: {player.rd.toFixed(0)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rating - More prominent */}
          <div className="text-right flex-shrink-0 ml-4">
            <div className="text-xs text-gray-500 mb-1">Rating</div>
            <div className={`text-xl font-bold ${getRatingColor(player.rating)}`}>
              {Math.round(player.rating)}
            </div>
          </div>
        </div>

        {/* Additional Details (Optional and Compact) */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-4 gap-2 text-xs text-center">
              <div>
                <div className="text-gray-500">RD</div>
                <div className="font-medium">{player.rd.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-gray-500">Sigma</div>
                <div className="font-medium">{player.sigma.toFixed(3)}</div>
              </div>
              <div>
                <div className="text-gray-500">% Vic</div>
                <div className="font-medium text-green-600">{winRate}%</div>
              </div>
              <div>
                <div className="text-gray-500">Total</div>
                <div className="font-medium">{totalMatches}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
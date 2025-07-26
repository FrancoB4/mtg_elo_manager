import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BsArrowUp, 
  BsArrowUpRight, 
  BsArrowRight, 
  BsArrowDownRight, 
  BsArrowDown,
  BsPerson
} from 'react-icons/bs';
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
  // Helper function to render icons with proper typing
  const renderIcon = (IconComponent: React.ComponentType<{ className?: string }>, className: string = "w-4 h-4") => {
    return React.createElement(IconComponent, { className });
  };

  const getTendencyIcon = (tendency: number) => {
    switch (tendency) {
      case 2: return { 
        icon: renderIcon(BsArrowUp, "w-5 h-5"), 
        color: 'text-green-700', 
        bg: 'bg-green-100',
        text: 'Subiendo fuerte'
      };
      case 1: return { 
        icon: renderIcon(BsArrowUpRight, "w-5 h-5"), 
        color: 'text-green-600', 
        bg: 'bg-green-50',
        text: 'Subiendo'
      };
      case 0: return { 
        icon: renderIcon(BsArrowRight, "w-5 h-5"), 
        color: 'text-gray-600', 
        bg: 'bg-gray-100',
        text: 'Estable'
      };
      case -1: return { 
        icon: renderIcon(BsArrowDownRight, "w-5 h-5"), 
        color: 'text-red-600', 
        bg: 'bg-red-50',
        text: 'Bajando'
      };
      case -2: return { 
        icon: renderIcon(BsArrowDown, "w-5 h-5"), 
        color: 'text-red-700', 
        bg: 'bg-red-100',
        text: 'Bajando fuerte'
      };
      default: return { 
        icon: renderIcon(BsArrowRight, "w-5 h-5"), 
        color: 'text-gray-600', 
        bg: 'bg-gray-100',
        text: 'Sin datos'
      };
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2000) return 'text-purple-600';
    if (rating >= 1800) return 'text-blue-600';
    if (rating >= 1600) return 'text-green-600';
    if (rating >= 1400) return 'text-yellow-600';
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
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Left section - Rank and Player info */}
          <div className="flex items-center space-x-4">
            {/* Rank */}
            <div className="text-2xl font-bold text-gray-800 min-w-[60px]">
              {getRankDisplay(rank)}
            </div>

            {/* Player info */}
            <div className="flex-1">
              <Link 
                to={`/players/${player.id}`}
                className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors group"
              >
                {renderIcon(BsPerson, "w-5 h-5 text-gray-400 group-hover:text-indigo-500")}
                <span>{player.name}</span>
              </Link>
              
              {/* Rating */}
              <div className={`text-2xl font-bold mt-1 ${getRatingColor(player.rating)}`}>
                {Math.round(player.rating)}
                <span className="text-sm font-normal text-gray-500 ml-2">rating</span>
              </div>
            </div>
          </div>

          {/* Right section - Tendency */}
          <div className="flex flex-col items-center">
            <div 
              className={`flex items-center justify-center w-12 h-12 rounded-full ${tendency.bg} ${tendency.color} transition-all duration-200 hover:scale-110 cursor-help`}
              title={tendency.text}
            >
              {tendency.icon}
            </div>
            <span className="text-xs text-gray-500 mt-1">Tendencia</span>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total matches */}
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{totalMatches}</div>
            <div className="text-xs text-gray-500">Partidas</div>
          </div>

          {/* Win-Draw-Loss */}
          <div className="text-center">
            <div className="text-sm text-gray-600">
              <span className="text-green-600 font-medium">{player.matches_won}</span>
              <span className="text-gray-400 mx-1">-</span>
              <span className="text-yellow-600 font-medium">{player.matches_drawn}</span>
              <span className="text-gray-400 mx-1">-</span>
              <span className="text-red-600 font-medium">{player.matches_lost}</span>
            </div>
            <div className="text-xs text-gray-500">V-E-D</div>
          </div>

          {/* Win rate */}
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{winRate}%</div>
            <div className="text-xs text-gray-500">Victorias</div>
          </div>

          {/* RD - Solo mostrar si showDetails es true Y el jugador tiene RD */}
          {showDetails && player.rd !== undefined && player.rd !== null && (
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-600">{player.rd.toFixed(0)}</div>
              <div className="text-xs text-gray-500">RD</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
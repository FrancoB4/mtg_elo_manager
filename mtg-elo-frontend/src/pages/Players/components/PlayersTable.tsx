import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BsArrowUp, 
  BsArrowUpRight, 
  BsArrowRight, 
  BsArrowDownRight, 
  BsArrowDown,
  BsPerson
} from 'react-icons/bs';
import type { Player } from '../../../types/players';

interface PlayersTableProps {
  players: Player[];
  startRank: number;
  showDetails?: boolean;
}

export const PlayersTable: React.FC<PlayersTableProps> = ({ 
  players, 
  startRank, 
  showDetails = true 
}) => {
  const navigate = useNavigate();

  // Helper function to render icons with proper typing
  const renderIcon = (IconComponent: React.ComponentType<{ className?: string }>, className: string = "w-4 h-4") => {
    return React.createElement(IconComponent, { className });
  };

  const getTendencyIcon = (tendency: number) => {
    switch (tendency) {
      case 2: return { 
        icon: renderIcon(BsArrowUp, "w-4 h-4"), 
        color: 'text-green-700', 
        bg: 'bg-green-100',
        text: 'Subiendo fuerte'
      };
      case 1: return { 
        icon: renderIcon(BsArrowUpRight, "w-4 h-4"), 
        color: 'text-green-600', 
        bg: 'bg-green-50',
        text: 'Subiendo'
      };
      case 0: return { 
        icon: renderIcon(BsArrowRight, "w-4 h-4"), 
        color: 'text-gray-600', 
        bg: 'bg-gray-100',
        text: 'Estable'
      };
      case -1: return { 
        icon: renderIcon(BsArrowDownRight, "w-4 h-4"), 
        color: 'text-red-600', 
        bg: 'bg-red-50',
        text: 'Bajando'
      };
      case -2: return { 
        icon: renderIcon(BsArrowDown, "w-4 h-4"), 
        color: 'text-red-700', 
        bg: 'bg-red-100',
        text: 'Bajando fuerte'
      };
      default: return { 
        icon: renderIcon(BsArrowRight, "w-4 h-4"), 
        color: 'text-gray-600', 
        bg: 'bg-gray-100',
        text: 'Sin datos'
      };
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

  const handleRowClick = (playerId: string | number) => {
    navigate(`/players/${playerId}`);
  };

  // Check if any player has RD data to determine if we should show the column
  const hasRdData = players.some(player => player.rd !== undefined && player.rd !== null);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posición
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jugador
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tendencia
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partidas
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                V-E-D
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Victorias
              </th>
              {/* Solo mostrar RD si showDetails es true Y hay datos de RD */}
              {showDetails && hasRdData && (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RD
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player, index) => {
              const rank = startRank + index;
              const tendency = getTendencyIcon(player.last_tendency);
              const totalMatches = player.matches_won + player.matches_drawn + player.matches_lost;
              const winRate = totalMatches > 0 
                ? ((player.matches_won / totalMatches) * 100).toFixed(1)
                : '0.0';

              return (
                <tr 
                  key={player.id || index}
                  onClick={() => handleRowClick(player.id ? player.id : index)}
                  className="hover:bg-indigo-50 transition-colors duration-150 cursor-pointer group"
                >
                  {/* Posición */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-800">
                      {getRankDisplay(rank)}
                    </div>
                  </td>

                  {/* Jugador */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {renderIcon(BsPerson, "w-4 h-4 text-gray-400 group-hover:text-indigo-500")}
                      <span className="truncate max-w-[150px]">{player.name}</span>
                    </div>
                  </td>

                  {/* Tendencia */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div 
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${tendency.bg} ${tendency.color} transition-all duration-200 group-hover:scale-110 cursor-help`}
                      title={tendency.text}
                    >
                      {tendency.icon}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className={`text-lg font-bold ${getRatingColor(player.rating)}`}>
                      {Math.round(player.rating)}
                    </div>
                  </td>

                  {/* Total Partidas */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {totalMatches}
                    </div>
                  </td>

                  {/* Victorias-Empates-Derrotas */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-600">
                      <span className="text-green-600 font-medium">{player.matches_won}</span>
                      <span className="text-gray-400 mx-1">-</span>
                      <span className="text-yellow-600 font-medium">{player.matches_drawn}</span>
                      <span className="text-gray-400 mx-1">-</span>
                      <span className="text-red-600 font-medium">{player.matches_lost}</span>
                    </div>
                  </td>

                  {/* Porcentaje de Victorias */}
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-green-600">
                      {winRate}%
                    </div>
                  </td>

                  {/* RD (solo si showDetails es true Y hay datos de RD Y el jugador tiene RD) */}
                  {showDetails && hasRdData && (
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-600">
                        {player.rd !== undefined && player.rd !== null 
                          ? player.rd.toFixed(0) 
                          : '-'
                        }
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {players.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron jugadores
          </h3>
          <p className="text-gray-600">
            No hay jugadores para mostrar en esta tabla
          </p>
        </div>
      )}
    </div>
  );
};
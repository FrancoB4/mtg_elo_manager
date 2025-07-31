import React from 'react';
import { BsTrophy, BsPerson } from 'react-icons/bs';
import { TournamentStanding } from '../../../services/tournamentService';

interface TournamentStandingsProps {
  standings: TournamentStanding[];
  loading?: boolean;
}

export const TournamentStandings: React.FC<TournamentStandingsProps> = ({ 
  standings, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clasificación</h3>
        <div className="animate-pulse">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clasificación</h3>
        <div className="text-center py-8">
          <BsPerson className="mx-auto h-12 w-12 text-gray-400" />
          <h4 className="mt-2 text-sm font-medium text-gray-900">No hay jugadores</h4>
          <p className="mt-1 text-sm text-gray-500">
            Aún no hay jugadores registrados en este torneo.
          </p>
        </div>
      </div>
    );
  }

  const getPositionIcon = (position: number) => {
    if (position === 1) return <BsTrophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <BsTrophy className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <BsTrophy className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const getPositionStyle = (position: number) => {
    if (position === 1) return 'bg-yellow-50 border-yellow-200';
    if (position === 2) return 'bg-gray-50 border-gray-200';
    if (position === 3) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BsTrophy className="h-5 w-5 mr-2 text-gray-600" />
          Clasificación
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pos
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jugador
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puntos
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partidas
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                W-L-D
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Victoria
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {standings.map((standing) => (
              <tr 
                key={standing.id} 
                className={`hover:bg-gray-50 border-l-4 ${getPositionStyle(standing.position)}`}
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    {getPositionIcon(standing.position)}
                    <span className={`ml-1 text-xs font-medium ${
                      standing.position <= 3 ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {standing.position}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div>
                    <div className="text-xs font-medium text-gray-900">
                      {standing.player.first_name} {standing.player.last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      @{standing.player.username}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  <span className="text-xs font-semibold text-gray-900">
                    {standing.points}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  <span className="text-xs font-medium text-blue-600">
                    {Math.round(standing.rating)}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  <span className="text-xs text-gray-600">
                    {standing.matches_played}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  <span className="text-xs text-gray-600">
                    {standing.matches_won}-{standing.matches_lost}-{standing.matches_drawn}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  <span className="text-xs text-gray-600">
                    {(standing.win_percentage * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

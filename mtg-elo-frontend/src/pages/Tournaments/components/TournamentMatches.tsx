import React from 'react';
import { BsTrophy } from 'react-icons/bs';
import { Match, RoundMatches } from '../../../services/tournamentService';

interface TournamentMatchesProps {
  roundMatches: RoundMatches[];
  loading?: boolean;
}

export const TournamentMatches: React.FC<TournamentMatchesProps> = ({ 
  roundMatches, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emparejamientos</h3>
        <div className="animate-pulse">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (roundMatches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emparejamientos</h3>
        <div className="text-center py-8">
          <BsTrophy className="mx-auto h-12 w-12 text-gray-400" />
          <h4 className="mt-2 text-sm font-medium text-gray-900">No hay emparejamientos</h4>
          <p className="mt-1 text-sm text-gray-500">
            Aún no se han generado los emparejamientos para este torneo.
          </p>
        </div>
      </div>
    );
  }

  const getResultBadge = (match: Match) => {
    if (!match.player2) {
      return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Bye</span>;
    }

    if (match.status === 'pending') {
      return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Pendiente</span>;
    }

    if (match.status === 'in_progress') {
      return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">En curso</span>;
    }

    if (match.status === 'completed') {
      return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Finalizado</span>;
    }

    return null;
  };

  const getPlayerStyle = (match: Match, isPlayer1: boolean) => {
    if (match.status !== 'completed' || !match.result) {
      return 'text-gray-900';
    }

    const isWinner = (isPlayer1 && match.result === 'player1_win') || 
                     (!isPlayer1 && match.result === 'player2_win');
    
    return isWinner ? 'text-green-700 font-semibold' : 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BsTrophy className="h-5 w-5 mr-2 text-gray-600" />
          Emparejamientos
        </h3>
      </div>
      
      <div className="p-4 space-y-6">
        {roundMatches.map((round) => (
          <div key={round.round}>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 bg-gray-50 px-3 py-2 rounded">
              Ronda {round.round}
            </h4>
            
            <div className="space-y-2">
              {round.matches.map((match) => (
                <div 
                  key={match.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Jugador 1 */}
                  <div className={`flex-1 text-right pr-4 ${getPlayerStyle(match, true)}`}>
                    {match.player1 ? (
                      <div>
                        <span className="text-sm font-medium">
                          {match.player1.first_name} {match.player1.last_name}
                        </span>
                        <div className="text-xs text-gray-500">
                          @{match.player1.username}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin jugador</span>
                    )}
                  </div>

                  {/* Resultado central */}
                  <div className="flex items-center space-x-3 min-w-0 flex-shrink-0">
                    {match.status === 'completed' && match.player2 ? (
                      <div className="flex items-center space-x-2 text-lg font-bold">
                        <span className={match.result === 'player1_win' ? 'text-green-600' : 'text-gray-600'}>
                          {match.player1_games}
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className={match.result === 'player2_win' ? 'text-green-600' : 'text-gray-600'}>
                          {match.player2_games}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {getResultBadge(match)}
                      </div>
                    )}
                  </div>

                  {/* Jugador 2 */}
                  <div className={`flex-1 text-left pl-4 ${getPlayerStyle(match, false)}`}>
                    {match.player2 ? (
                      <div>
                        <span className="text-sm font-medium">
                          {match.player2.first_name} {match.player2.last_name}
                        </span>
                        <div className="text-xs text-gray-500">
                          @{match.player2.username}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Bye</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

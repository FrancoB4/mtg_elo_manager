import React, { useState, useEffect } from 'react';
import { BsCheckCircle, BsX } from 'react-icons/bs';
import { useToast } from '../../../hooks/useToast';

interface PendingMatch {
  id: number;
  tournament_name: string;
  round: number;
  opponent: {
    id: number;
    name: string;
    username: string;
  } | null;
  table_number?: number;
  status: 'pending' | 'in_progress';
}

export const PendingMatches: React.FC = () => {
  const { success, error: showError } = useToast();
  const [matches, setMatches] = useState<PendingMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportingResult, setReportingResult] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<PendingMatch | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultForm, setResultForm] = useState({
    myGames: 0,
    opponentGames: 0,
  });

  useEffect(() => {
    fetchPendingMatches();
  }, []);

  const fetchPendingMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar el servicio para obtener partidas pendientes del usuario
      // const pendingMatches = await tournamentService.getMyPendingMatches();
      
      // Datos de ejemplo por ahora
      const mockMatches: PendingMatch[] = [
        {
          id: 1,
          tournament_name: "Torneo Local Agosto 2025",
          round: 2,
          opponent: {
            id: 2,
            name: "María García",
            username: "maria_garcia"
          },
          table_number: 3,
          status: 'pending'
        },
        {
          id: 2,
          tournament_name: "Campeonato Regional 2025",
          round: 1,
          opponent: null, // Bye
          status: 'pending'
        }
      ];
      
      setMatches(mockMatches);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las partidas pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleReportResult = (match: PendingMatch) => {
    setSelectedMatch(match);
    setResultForm({ myGames: 0, opponentGames: 0 });
    setShowResultModal(true);
  };

  const submitResult = async () => {
    if (!selectedMatch) return;

    try {
      setReportingResult(selectedMatch.id);
      
      // TODO: Implementar el servicio para reportar resultados
      // await tournamentService.reportMatchResult(selectedMatch.id, {
      //   player_games: resultForm.myGames,
      //   opponent_games: resultForm.opponentGames
      // });
      
      // Simular el envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar la lista
      await fetchPendingMatches();
      
      // Cerrar modal
      setShowResultModal(false);
      setSelectedMatch(null);
      
      success('¡Resultado reportado!', '¡Resultado reportado exitosamente!');
    } catch (err: any) {
      showError('Error al reportar resultado', err.message || 'Error al reportar el resultado');
    } finally {
      setReportingResult(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <BsX className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={fetchPendingMatches}
          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <BsCheckCircle className="mx-auto h-12 w-12 text-green-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay partidas pendientes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Todas tus partidas están al día.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{match.tournament_name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Ronda {match.round}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  {match.table_number && (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      Mesa {match.table_number}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${
                    match.status === 'pending' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {match.status === 'pending' ? 'Pendiente' : 'En curso'}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <span className="text-gray-700">vs</span>
                  <div className="ml-2">
                    {match.opponent ? (
                      <div>
                        <span className="font-medium text-gray-900">{match.opponent.name}</span>
                        <span className="text-gray-500 ml-2">@{match.opponent.username}</span>
                      </div>
                    ) : (
                      <span className="font-medium text-blue-600 italic">Bye (Descanso)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="ml-6">
                <button
                  onClick={() => handleReportResult(match)}
                  disabled={reportingResult === match.id}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <BsCheckCircle className="h-4 w-4 mr-2" />
                  Reportar Resultado
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para reportar resultado */}
      {showResultModal && selectedMatch && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reportar Resultado
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedMatch.tournament_name}</strong> - Ronda {selectedMatch.round}
                </p>
                <p className="text-sm text-gray-600">
                  vs {selectedMatch.opponent ? selectedMatch.opponent.name : 'Bye'}
                </p>
              </div>

              {selectedMatch.opponent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mis juegos ganados
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={resultForm.myGames}
                      onChange={(e) => setResultForm({...resultForm, myGames: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Juegos ganados por {selectedMatch.opponent.name}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={resultForm.opponentGames}
                      onChange={(e) => setResultForm({...resultForm, opponentGames: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">
                    Esta es una partida Bye. Recibirás automáticamente la victoria.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitResult}
                  disabled={reportingResult === selectedMatch.id}
                  className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    reportingResult === selectedMatch.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {reportingResult === selectedMatch.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                      Enviando...
                    </>
                  ) : (
                    'Confirmar Resultado'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

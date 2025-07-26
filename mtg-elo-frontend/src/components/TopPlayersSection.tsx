import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayerCard } from '../pages/Players/components/PlayerCard';
import { InlineSpinner } from './ui/LoadingSpinner';
import { InlineErrorMessage } from './ui/ErrorMessage';
import { playersService } from '../services/playersService';
import type { Player } from '../types/players';

export const TopPlayersSection: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTopPlayers();
  }, []);

  const loadTopPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar solo los top 6 jugadores para el homepage
      const response = await playersService.getPlayerRanking({
        type: 'global',
        page: 1,
        pageSize: 6,
        search: '',
      });
      
      setPlayers(response.results);
    } catch (err) {
      console.error('Error loading top players:', err);
      setError('Error al cargar el ranking de jugadores');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">🏆 Top Jugadores</h2>
          <p className="text-sm text-gray-600 mt-1">Ranking global de los mejores jugadores</p>
        </div>
        <div className="flex items-center space-x-4">
          {loading && (
            <div className="flex items-center space-x-2">
              <InlineSpinner size="sm" />
              <span className="text-sm text-gray-600">Cargando...</span>
            </div>
          )}
          <Link
            to="/rankings/global"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
          >
            Ver ranking completo
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {error ? (
        <InlineErrorMessage 
          message={error} 
          onRetry={loadTopPlayers}
          variant="error"
        />
      ) : players.length === 0 && !loading ? (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aún no hay jugadores registrados
          </h3>
          <p className="text-gray-600">
            Los jugadores aparecerán aquí una vez que se registren partidas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {players.map((player, index) => (
            <PlayerCard
              key={player.id || index}
              player={player}
              rank={index + 1}
              showDetails={false} // Mostrar vista compacta en homepage
            />
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/rankings/global"
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          🌍 Ranking Global
        </Link>
        <Link
          to="/rankings?type=tournament"
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          🎯 Ranking por Torneo
        </Link>
        <Link
          to="/rankings?type=league"
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          🏆 Ranking por Liga
        </Link>
      </div>
    </div>
  );
};
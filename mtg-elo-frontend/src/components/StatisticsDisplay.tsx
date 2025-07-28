import React from 'react';
import { GlobalStatistics } from '../services/statisticsService';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { InlineErrorMessage } from './ui/ErrorMessage';

interface StatisticsDisplayProps {
  statistics: GlobalStatistics | null;
  loading: boolean;
  error: string | null;
}

export const StatisticsDisplay: React.FC<StatisticsDisplayProps> = ({
  statistics,
  loading,
  error
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 relative">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Estadísticas Generales</h2>
        
        {/* Skeleton for main statistics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-9 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Skeleton for player highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-20"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-28"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading spinner overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Estadísticas Generales</h2>
        
        {/* Main Statistics Grid - Empty state */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-9 mb-2 flex items-center justify-center">
                <span className="text-2xl text-gray-400">—</span>
              </div>
              <div className="h-4 flex items-center justify-center">
                <span className="text-sm text-gray-400">
                  {i === 1 && 'Jugadores'}
                  {i === 2 && 'Torneos'}
                  {i === 3 && 'Partidas'}
                  {i === 4 && 'Rating Promedio'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Error message in place of player highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <InlineErrorMessage message={error} />
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Estadísticas Generales</h2>
        
        {/* Main Statistics Grid - Empty state */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-9 mb-2 flex items-center justify-center">
                <span className="text-2xl text-gray-400">—</span>
              </div>
              <div className="h-4 flex items-center justify-center">
                <span className="text-sm text-gray-400">
                  {i === 1 && 'Jugadores'}
                  {i === 2 && 'Torneos'}
                  {i === 3 && 'Partidas'}
                  {i === 4 && 'Rating Promedio'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* No data message in place of player highlights */}
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Estadísticas Generales</h2>
      
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{statistics.total_players}</p>
          <p className="text-sm text-gray-500">Jugadores</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">
            {statistics.total_tournaments || 0}
          </p>
          <p className="text-sm text-gray-500">Torneos</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-600">{statistics.total_matches}</p>
          <p className="text-sm text-gray-500">Partidas</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-orange-600">
            {Math.round(statistics.average_rating)}
          </p>
          <p className="text-sm text-gray-500">Rating Promedio</p>
        </div>
      </div>

      {/* Player Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Most Active Player */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Más Activo</h3>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">
              {statistics.most_active_player.name || 'Sin datos'}
            </p>
            <p className="text-sm text-gray-600">
              Rating: <span className="font-medium">
                {statistics.most_active_player.rating 
                  ? Math.round(statistics.most_active_player.rating) 
                  : 'N/A'}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Partidas: <span className="font-medium">
                {statistics.most_active_player.matches_played || 'N/A'}
              </span>
            </p>
          </div>
        </div>

        {/* Highest Rated Player */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Mejor Rating</h3>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{statistics.highest_rated_player.name}</p>
            <p className="text-sm text-gray-600">
              Rating: <span className="font-medium">{Math.round(statistics.highest_rated_player.rating)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Partidas: <span className="font-medium">{statistics.highest_rated_player.matches_played}</span>
            </p>
          </div>
        </div>

        {/* Lowest Rated Player */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Menor Rating</h3>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{statistics.lowest_rated_player.name}</p>
            <p className="text-sm text-gray-600">
              Rating: <span className="font-medium">{Math.round(statistics.lowest_rated_player.rating)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Partidas: <span className="font-medium">{statistics.lowest_rated_player.matches_played}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { PlayerCard } from './components/PlayerCard';
import { RankingFilters } from './components/RankingFilters';
import { LoadingSpinner, InlineSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage, InlineErrorMessage } from '../../components/ui/ErrorMessage';
import { playersService } from '../../services/playersService';
import type { Player, RankingType, RankingFilters as FilterType } from '../../types/players';

export const PlayersList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Determinar el tipo de ranking basado en la ruta
  const getRankingTypeFromRoute = (): RankingType => {
    const path = window.location.pathname;
    if (path.includes('/tournaments/') && path.includes('/rankings')) {
      return 'tournament';
    }
    if (path.includes('/leagues/') && path.includes('/rankings')) {
      return 'league';
    }
    return (searchParams.get('type') as RankingType) || 'global';
  };

  // Get filters from URL params
  const [filters, setFilters] = useState<FilterType>({
    type: getRankingTypeFromRoute(),
    tournamentId: params.id && window.location.pathname.includes('/tournaments/') ? params.id : searchParams.get('tournament_id') || undefined,
    leagueId: params.id && window.location.pathname.includes('/leagues/') ? params.id : searchParams.get('league_id') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('page_size') || '20'),
    search: searchParams.get('search') || '',
  });

  // Load players when filters change
  useEffect(() => {
    loadPlayers();
  }, [filters]);

  // Update URL when filters change (only for main rankings page)
  useEffect(() => {
    if (!window.location.pathname.includes('/tournaments/') && !window.location.pathname.includes('/leagues/')) {
      const params = new URLSearchParams();
      
      params.set('type', filters.type);
      if (filters.tournamentId) params.set('tournament_id', filters.tournamentId);
      if (filters.leagueId) params.set('league_id', filters.leagueId);
      if (filters.page > 1) params.set('page', filters.page.toString());
      if (filters.pageSize !== 20) params.set('page_size', filters.pageSize.toString());
      if (filters.search) params.set('search', filters.search);
      
      setSearchParams(params);
    }
  }, [filters, setSearchParams]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await playersService.getPlayerRanking(filters);
      setPlayers(response.results);
      setTotalCount(response.count);
    } catch (err) {
      console.error('Error loading players:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los jugadores');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<FilterType>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get page title based on context
  const getPageTitle = () => {
    if (filters.type === 'tournament' && filters.tournamentId) {
      return `🎯 Ranking del Torneo #${filters.tournamentId}`;
    }
    if (filters.type === 'league' && filters.leagueId) {
      return `🏆 Ranking de la Liga #${filters.leagueId}`;
    }
    return '🏆 Ranking de Jugadores';
  };

  const getPageDescription = () => {
    if (filters.type === 'tournament' && filters.tournamentId) {
      return `Clasificación de jugadores para el torneo #${filters.tournamentId}`;
    }
    if (filters.type === 'league' && filters.leagueId) {
      return `Clasificación de jugadores para la liga #${filters.leagueId}`;
    }
    if (filters.type === 'global') {
      return 'Ranking global de todos los jugadores';
    }
    return 'Ranking de jugadores';
  };

  if (loading && players.length === 0) {
    return <LoadingSpinner message="Cargando ranking de jugadores..." />;
  }

  if (error && players.length === 0) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadPlayers}
        title="Error al cargar el ranking"
      />
    );
  }

  const totalPages = Math.ceil(totalCount / filters.pageSize);
  const startRank = (filters.page - 1) * filters.pageSize + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getPageTitle()}
          </h1>
          <p className="mt-2 text-gray-600">
            {getPageDescription()}
          </p>
        </div>

        {/* Filters - Solo mostrar si no es una ruta específica de torneo/liga */}
        {!window.location.pathname.includes('/tournaments/') && !window.location.pathname.includes('/leagues/') && (
          <RankingFilters 
            filters={filters}
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
        )}

        {/* Error message for partial loads */}
        {error && players.length > 0 && (
          <div className="mb-4">
            <InlineErrorMessage 
              message={error} 
              variant="warning" 
              onRetry={loadPlayers}
            />
          </div>
        )}

        {/* Results info */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando {players.length} de {totalCount} jugadores
            {filters.search && (
              <span className="ml-2">
                • Búsqueda: "<strong>{filters.search}</strong>"
              </span>
            )}
          </div>
          
          {loading && (
            <div className="flex items-center space-x-2">
              <InlineSpinner size="sm" />
              <span className="text-sm text-gray-600">Actualizando...</span>
            </div>
          )}
        </div>

        {/* Players List */}
        {players.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron jugadores
            </h3>
            <p className="text-gray-600">
              {filters.search 
                ? 'Intenta con una búsqueda diferente'
                : 'Aún no hay jugadores registrados en este ranking'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {players.map((player, index) => (
              <PlayerCard
                key={player.id || index}
                player={player}
                rank={startRank + index}
                showDetails={filters.type !== 'global'}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <nav className="flex justify-center">
              <div className="flex space-x-2">
                {/* Previous page */}
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    filters.page <= 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Anterior
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, filters.page - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pageNum === filters.page
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next page */}
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    filters.page >= totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersList;
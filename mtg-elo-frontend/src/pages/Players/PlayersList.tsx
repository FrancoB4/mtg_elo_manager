import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { PlayerCard } from './components/PlayerCard';
import { PlayersTable } from './components/PlayersTable';
import { ViewToggle, ViewType } from './components/ViewToggle';
import { RankingFilters } from './components/RankingFilters';
import { LoadingSpinner, InlineSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage, InlineErrorMessage } from '../../components/ui/ErrorMessage';
import { playersService } from '../../services/playersService';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import type { Player, RankingType, RankingFilters as FilterType } from '../../types/players';

export const PlayersList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentView, setCurrentView] = useState<ViewType>('table');
  
  // Helper function to render icons with proper typing
  const renderIcon = (IconComponent: React.ComponentType<{ className?: string }>, className: string = "w-4 h-4") => {
    return React.createElement(IconComponent, { className });
  };

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

  // Get tournament name from params if in tournament route
  const getTournamentNameFromRoute = (): string | undefined => {
    if (window.location.pathname.includes('/tournaments/') && params.name) {
      return decodeURIComponent(params.name);
    }
    return searchParams.get('tournament_name') || undefined;
  };

  // Get filters from URL params
  const [filters, setFilters] = useState<FilterType>({
    type: getRankingTypeFromRoute(),
    tournamentName: getTournamentNameFromRoute(),  // Cambiado de tournamentId a tournamentName
    leagueId: params.id && window.location.pathname.includes('/leagues/') ? params.id : searchParams.get('league_id') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('page_size') || '20'),
    search: searchParams.get('search') || '',
  });

  // Update URL when filters change (only for main rankings page)
  useEffect(() => {
    if (!window.location.pathname.includes('/tournaments/') && !window.location.pathname.includes('/leagues/')) {
      const params = new URLSearchParams();
      
      params.set('type', filters.type);
      if (filters.tournamentName) params.set('tournament_name', filters.tournamentName);  // Cambiado
      if (filters.leagueId) params.set('league_id', filters.leagueId);
      if (filters.page > 1) params.set('page', filters.page.toString());
      if (filters.pageSize !== 20) params.set('page_size', filters.pageSize.toString());
      if (filters.search) params.set('search', filters.search);
      
      setSearchParams(params);
    }
  }, [filters, setSearchParams]);

  // Persist view preference in localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('playersListView') as ViewType;
    if (savedView && (savedView === 'cards' || savedView === 'table')) {
      setCurrentView(savedView);
    }
  }, []);

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    localStorage.setItem('playersListView', view);
  };

  const loadPlayers = useCallback(async () => {
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
  }, [filters]);

  // Load players when filters change
  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

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
    if (filters.type === 'tournament' && filters.tournamentName) {
      return `🎯 Ranking del Torneo "${filters.tournamentName}"`;  // Mostrar nombre
    }
    if (filters.type === 'league' && filters.leagueId) {
      return `🏆 Ranking de la Liga #${filters.leagueId}`;
    }
    return '🏆 Ranking de Jugadores';
  };

  const getPageDescription = () => {
    if (filters.type === 'tournament' && filters.tournamentName) {
      return `Clasificación de jugadores para el torneo "${filters.tournamentName}"`;  // Mostrar nombre
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

  // Helper function to generate page numbers for pagination
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, filters.page - delta); 
         i <= Math.min(totalPages - 1, filters.page + delta); 
         i++) {
      range.push(i);
    }

    if (filters.page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (filters.page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

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

        {/* Results info and View Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            Mostrando {players.length} de {totalCount} jugadores
            {filters.search && (
              <span className="ml-2">
                • Búsqueda: "<strong>{filters.search}</strong>"
              </span>
            )}
            {filters.tournamentName && (
              <span className="ml-2">
                • Torneo: "<strong>{filters.tournamentName}</strong>"
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {loading && (
              <div className="flex items-center space-x-2">
                <InlineSpinner size="sm" />
                <span className="text-sm text-gray-600">Actualizando...</span>
              </div>
            )}
            
            {/* View Toggle */}
            <ViewToggle 
              currentView={currentView}
              onViewChange={handleViewChange}
            />
          </div>
        </div>

        {/* Players List/Table */}
        {players.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron jugadores
            </h3>
            <p className="text-gray-600">
              {filters.search 
                ? 'Intenta con una búsqueda diferente'
                : filters.tournamentName 
                  ? `No hay jugadores registrados en el torneo "${filters.tournamentName}"`
                  : 'Aún no hay jugadores registrados en este ranking'
              }
            </p>
          </div>
        ) : (
          <>
            {currentView === 'cards' ? (
              <div className="space-y-3">
                {players.map((player, index) => (
                  <PlayerCard
                    key={player.id || index}
                    player={player}
                    rank={startRank + index}
                    showDetails={filters.type !== 'global'}
                  />
                ))}
              </div>
            ) : (
              <PlayersTable
                players={players}
                startRank={startRank}
                showDetails={filters.type !== 'global'}
              />
            )}
          </>
        )}

        {/* Pagination - Mejorada con iconos */}
        {totalPages > 1 && (
          <div className="mt-8">
            <nav className="flex justify-center">
              <div className="flex items-center space-x-1">
                {/* Previous page */}
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filters.page <= 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {renderIcon(BsChevronLeft)}
                  <span>Anterior</span>
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((pageNum, index) => {
                  if (pageNum === '...') {
                    return (
                      <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum as number)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pageNum === filters.page
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
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
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filters.page >= totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span>Siguiente</span>
                  {renderIcon(BsChevronRight)}
                </button>
              </div>
            </nav>

            {/* Page info */}
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">
                Página {filters.page} de {totalPages} • {totalCount} jugadores en total
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
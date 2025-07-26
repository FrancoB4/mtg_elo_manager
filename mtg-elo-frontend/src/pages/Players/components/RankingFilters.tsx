import React, { useState, useEffect } from 'react';
import type { RankingFilters as FilterType, RankingType } from '../../../types/players';

interface RankingFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  loading?: boolean;
}

export const RankingFilters: React.FC<RankingFiltersProps> = ({
  filters,
  onFiltersChange,
  loading = false
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ search: searchInput });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFiltersChange]);

  const handleTypeChange = (type: RankingType) => {
    onFiltersChange({
      type,
      tournamentId: type === 'tournament' ? filters.tournamentId : undefined,
      leagueId: type === 'league' ? filters.leagueId : undefined,
    });
  };

  const handlePageSizeChange = (pageSize: number) => {
    onFiltersChange({ pageSize, page: 1 });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Ranking Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Ranking
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleTypeChange(e.target.value as RankingType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="global">🌍 Global</option>
            <option value="league">🏆 Liga</option>
            <option value="tournament">🎯 Torneo</option>
          </select>
        </div>

        {/* Tournament/League ID */}
        {(filters.type === 'tournament' || filters.type === 'league') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filters.type === 'tournament' ? 'ID del Torneo' : 'ID de la Liga'}
            </label>
            <input
              type="text"
              value={filters.type === 'tournament' ? filters.tournamentId || '' : filters.leagueId || ''}
              onChange={(e) => onFiltersChange({
                [filters.type === 'tournament' ? 'tournamentId' : 'leagueId']: e.target.value || undefined
              })}
              placeholder={`Ingresa ID ${filters.type === 'tournament' ? 'del torneo' : 'de la liga'}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
        )}

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar Jugador
          </label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nombre del jugador..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Page Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jugadores por página
          </label>
          <select
            value={filters.pageSize}
            onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
          {filters.type === 'global' && '🌍 Ranking Global'}
          {filters.type === 'league' && `🏆 Liga: ${filters.leagueId || 'Sin especificar'}`}
          {filters.type === 'tournament' && `🎯 Torneo: ${filters.tournamentId || 'Sin especificar'}`}
        </span>
        
        {filters.search && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            🔍 "{filters.search}"
          </span>
        )}
        
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
          📄 {filters.pageSize} por página
        </span>
      </div>
    </div>
  );
};
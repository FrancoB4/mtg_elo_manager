import React, { useState, useEffect } from 'react';
import { BsSearch, BsFilter, BsX } from 'react-icons/bs';
import type { RankingFilters as RankingFiltersType, RankingType } from '../../../types/players';

interface RankingFiltersProps {
  filters: RankingFiltersType;
  onFiltersChange: (filters: Partial<RankingFiltersType>) => void;
  loading?: boolean;
}

export const RankingFilters: React.FC<RankingFiltersProps> = ({
  filters,
  onFiltersChange,
  loading = false
}) => {
  // Estados locales para los valores de los inputs
  const [localFilters, setLocalFilters] = useState({
    type: filters.type,
    search: filters.search || '',
    tournamentName: filters.tournamentName || '',
    leagueId: filters.leagueId || ''
  });

  // Helper function to render icons with proper typing
  const renderIcon = (IconComponent: React.ComponentType<{ className?: string }>, className: string = "w-4 h-4") => {
    return React.createElement(IconComponent, { className });
  };

  // Sync local state with props when filters change externally (e.g., URL changes)
  useEffect(() => {
    setLocalFilters({
      type: filters.type,
      search: filters.search || '',
      tournamentName: filters.tournamentName || '',
      leagueId: filters.leagueId || ''
    });
  }, [filters.type, filters.search, filters.tournamentName, filters.leagueId]);

  const handleTypeChange = (type: RankingType) => {
    setLocalFilters(prev => ({
      ...prev,
      type,
      // Limpiar filtros específicos cuando se cambia el tipo
      tournamentName: type === 'tournament' ? prev.tournamentName : '',
      leagueId: type === 'league' ? prev.leagueId : '',
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    const filtersToApply: Partial<RankingFiltersType> = {
      type: localFilters.type,
      search: localFilters.search || undefined,
      page: 1 // Reset to first page when applying filters
    };

    // Solo incluir filtros específicos según el tipo
    if (localFilters.type === 'tournament' && localFilters.tournamentName) {
      filtersToApply.tournamentName = localFilters.tournamentName;
    } else {
      filtersToApply.tournamentName = undefined;
    }

    if (localFilters.type === 'league' && localFilters.leagueId) {
      filtersToApply.leagueId = localFilters.leagueId;
    } else {
      filtersToApply.leagueId = undefined;
    }

    onFiltersChange(filtersToApply);
  };

  const clearFilters = () => {
    const clearedFilters = {
      type: 'global' as RankingType,
      search: '',
      tournamentName: '',
      leagueId: ''
    };
    
    setLocalFilters(clearedFilters);
    
    onFiltersChange({
      type: 'global',
      search: undefined,
      tournamentName: undefined,
      leagueId: undefined,
      page: 1
    });
  };

  // Check if there are changes to apply
  const hasChangesToApply = () => {
    if (localFilters.type !== filters.type) return true;
    if (localFilters.search !== (filters.search || '')) return true;
    if (localFilters.tournamentName !== (filters.tournamentName || '')) return true;
    if (localFilters.leagueId !== (filters.leagueId || '')) return true;
    return false;
  };

  const hasActiveFilters = !!(filters.search || filters.tournamentName || filters.leagueId || filters.type !== 'global');

  // Handle Enter key to apply filters
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hasChangesToApply()) {
      applyFilters();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Tipo de ranking */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de ranking
        </label>
        <div className="flex flex-wrap gap-2">
          {(['global', 'tournament', 'league'] as RankingType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                localFilters.type === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {type === 'global' && '🌍 Global'}
              {type === 'tournament' && '🎯 Torneo'}
              {type === 'league' && '🏆 Liga'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Búsqueda por jugador */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Buscar jugador
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {renderIcon(BsSearch, "w-4 h-4 text-gray-400")}
            </div>
            <input
              id="search"
              type="text"
              value={localFilters.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nombre del jugador..."
            />
          </div>
        </div>

        {/* Filtro por nombre de torneo - Solo mostrar si el tipo es 'tournament' */}
        {localFilters.type === 'tournament' && (
          <div>
            <label htmlFor="tournamentName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del torneo
            </label>
            <div className="relative">
              <input
                id="tournamentName"
                type="text"
                value={localFilters.tournamentName}
                onChange={(e) => handleInputChange('tournamentName', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nombre del torneo..."
              />
            </div>
          </div>
        )}

        {/* Filtro por ID de liga - Solo mostrar si el tipo es 'league' */}
        {localFilters.type === 'league' && (
          <div>
            <label htmlFor="leagueId" className="block text-sm font-medium text-gray-700 mb-2">
              ID de la liga
            </label>
            <div className="relative">
              <input
                id="leagueId"
                type="text"
                value={localFilters.leagueId}
                onChange={(e) => handleInputChange('leagueId', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="ID de la liga..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        {/* Botón aplicar filtros */}
        <button
          onClick={applyFilters}
          disabled={loading || !hasChangesToApply()}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            hasChangesToApply() && !loading
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {renderIcon(BsFilter)}
          <span>Aplicar filtros</span>
        </button>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {renderIcon(BsX)}
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Ayuda */}
      {hasChangesToApply() && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            💡 Presiona <strong>Enter</strong> en cualquier campo o haz clic en <strong>"Aplicar filtros"</strong> para buscar.
          </p>
        </div>
      )}

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.type !== 'global' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Tipo: {filters.type === 'tournament' ? '🎯 Torneo' : '🏆 Liga'}
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Búsqueda: {filters.search}
            </span>
          )}
          {filters.tournamentName && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Torneo: {filters.tournamentName}
            </span>
          )}
          {filters.leagueId && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Liga: #{filters.leagueId}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPeople, BsTrophy, BsEye } from 'react-icons/bs';
import { Tournament } from '../../services/tournamentService';
import { useTournaments } from '../../hooks/useTournaments';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

interface TournamentsListProps {
  // Props adicionales si necesitas
}

export const TournamentsList: React.FC<TournamentsListProps> = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const { tournaments, loading, error, refetch } = useTournaments({
    page: currentPage,
  });

  const getStatusBadge = (state?: Tournament['state']) => {
    if (!state) return null;
    
    const statusConfig = {
      PROGRAMMED: { color: 'bg-blue-100 text-blue-800', text: 'Próximo' },
      STARTED: { color: 'bg-green-100 text-green-800', text: 'En curso' },
      FINISHED: { color: 'bg-gray-100 text-gray-800', text: 'Finalizado' },
    };

    const config = statusConfig[state];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTournamentClick = (tournamentId: number) => {
    navigate(`/tournaments/${tournamentId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Torneos</h2>
          <p className="text-gray-600">Lista de todos los torneos disponibles</p>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-12">
          <BsTrophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay torneos</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron torneos disponibles.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 cursor-pointer"
              onClick={() => handleTournamentClick(tournament.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tournament.name}
                    </h3>
                    {tournament.state && (
                      <div className="mb-3">
                        {getStatusBadge(tournament.state)}
                      </div>
                    )}
                  </div>
                  <BsEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    📅 {formatDate(tournament.date)}
                    {tournament.start_time && (
                      <span className="ml-2 flex items-center">
                        🕐 {formatTime(tournament.start_time)}
                      </span>
                    )}
                  </div>

                  {tournament.current_players !== undefined && tournament.max_players && (
                    <div className="flex items-center text-sm text-gray-600">
                      <BsPeople className="h-4 w-4 mr-2" />
                      {tournament.current_players}/{tournament.max_players} jugadores
                    </div>
                  )}

                  {tournament.format && (
                    <div className="flex items-center text-sm text-gray-600">
                      <BsTrophy className="h-4 w-4 mr-2" />
                      {tournament.format.charAt(0).toUpperCase() + tournament.format.slice(1)}
                    </div>
                  )}

                  {tournament.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {tournament.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      ID: {tournament.id}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                      Ver detalles
                      <BsEye className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación simple */}
      {tournaments.length > 0 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

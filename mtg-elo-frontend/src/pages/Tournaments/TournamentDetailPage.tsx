import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsChevronLeft, BsPeople, BsTrophy, BsPersonPlus } from 'react-icons/bs';
import { useTournamentDetail } from '../../hooks/useTournamentDetail';
import { useAuth } from '../../hooks/authHook';
import { useRole } from '../../hooks/useRole';
import { useToast } from '../../hooks/useToast';
import tournamentService from '../../services/tournamentService';
import { TournamentStandings } from './components/TournamentStandings';
import { TournamentMatches } from './components/TournamentMatches';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export const TournamentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasRole } = useRole();
  const { success, error: showError } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const tournamentId = parseInt(id || '0', 10);

  const { 
    tournament, 
    standings, 
    roundMatches, 
    loading, 
    error, 
    refetch 
  } = useTournamentDetail({ tournamentId });

  // Función para manejar el registro en el torneo
  const handleRegisterToTournament = async () => {
    if (!user?.id || !tournament) return;

    setIsRegistering(true);
    try {
      await tournamentService.registerPlayerToTournament(tournament.id, user.id);
      success('¡Registro exitoso!', `Te has registrado exitosamente en "${tournament.name}"`);
      // Refrescar los datos del torneo para mostrar el jugador agregado
      refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse en el torneo';
      showError('Error en el registro', errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  // Verificar si el usuario puede registrarse
  const canRegister = () => {
    if (!user || !tournament) return false;
    if (!hasRole('PLAYER')) return false;
    if (tournament.state !== 'PROGRAMMED') return false;
    if (tournament.current_players && tournament.max_players && 
        tournament.current_players >= tournament.max_players) return false;
    // TODO: Verificar si el usuario ya está registrado
    return true;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Torneo no encontrado</h2>
          <p className="mt-2 text-gray-600">El torneo que buscas no existe o no tienes permisos para verlo.</p>
          <button
            onClick={() => navigate('/tournaments')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <BsChevronLeft className="mr-2 h-4 w-4" />
            Volver a torneos
          </button>
        </div>
      </div>
    );
  }

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

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      upcoming: { color: 'bg-blue-100 text-blue-800', text: 'Próximo' },
      ongoing: { color: 'bg-green-100 text-green-800', text: 'En curso' },
      finished: { color: 'bg-gray-100 text-gray-800', text: 'Finalizado' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelado' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/tournaments')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <BsChevronLeft className="mr-2 h-4 w-4" />
          Volver a torneos
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {tournament.name}
              </h1>
              
              {tournament.description && (
                <p className="text-gray-600 mb-4">
                  {tournament.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  📅 {formatDate(tournament.date)}
                  {tournament.start_time && (
                    <span className="ml-2 flex items-center">
                      🕐 {formatTime(tournament.start_time)}
                    </span>
                  )}
                </div>

                {tournament.current_players !== undefined && tournament.max_players && (
                  <div className="flex items-center">
                    <BsPeople className="h-4 w-4 mr-2" />
                    {tournament.current_players}/{tournament.max_players} jugadores
                  </div>
                )}

                {tournament.format && (
                  <div className="flex items-center">
                    <BsTrophy className="h-4 w-4 mr-2" />
                    {tournament.format.charAt(0).toUpperCase() + tournament.format.slice(1)}
                  </div>
                )}

                {tournament.location && (
                  <div className="flex items-center">
                    📍 {tournament.location}
                  </div>
                )}
              </div>
            </div>

            <div className="ml-6 flex items-center gap-4">
              {canRegister() && (
                <button
                  onClick={handleRegisterToTournament}
                  disabled={isRegistering}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <BsPersonPlus className="mr-2 h-4 w-4" />
                  {isRegistering ? 'Registrando...' : 'Registrarse'}
                </button>
              )}
              
              {tournament.state && getStatusBadge(tournament.state)}
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {tournament.entry_fee && (
                <div>
                  <span className="font-medium text-gray-900">Costo de entrada:</span>
                  <span className="ml-2 text-gray-600">${tournament.entry_fee}</span>
                </div>
              )}
              
              {tournament.prize_pool && (
                <div>
                  <span className="font-medium text-gray-900">Premio total:</span>
                  <span className="ml-2 text-gray-600">${tournament.prize_pool}</span>
                </div>
              )}

              {tournament.winner && (
                <div>
                  <span className="font-medium text-gray-900">Ganador:</span>
                  <span className="ml-2 text-gray-600">
                    {tournament.winner.name} (@{tournament.winner.username})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Standings */}
        <div>
          <TournamentStandings standings={standings} loading={loading} />
        </div>

        {/* Matches */}
        <div>
          <TournamentMatches roundMatches={roundMatches} loading={loading} />
        </div>
      </div>
    </div>
  );
};

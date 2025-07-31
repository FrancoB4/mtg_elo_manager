import React, { useState, useEffect } from 'react';
import { BsTrophy, BsPeople, BsCheckCircle, BsX } from 'react-icons/bs';
import tournamentService, { Tournament } from '../../../services/tournamentService';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../hooks/authHook';
import { useRole } from '../../../hooks/useRole';

export const AvailableTournaments: React.FC = () => {
  const { success, error: showError } = useToast();
  const { user } = useAuth();
  const { hasRole } = useRole();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState<number | null>(null);

  useEffect(() => {
    fetchAvailableTournaments();
  }, []);

  const fetchAvailableTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener torneos y filtrar los que están abiertos para inscripciones
      const tournamentsResponse = await tournamentService.getTournaments();
      const allTournaments = Array.isArray(tournamentsResponse) ? tournamentsResponse : tournamentsResponse.results;
      const availableTournaments = allTournaments.filter(
        (tournament: Tournament) => tournament.state === 'PROGRAMMED' || tournament.state === 'STARTED'
      );
      
      setTournaments(availableTournaments);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los torneos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (tournament: Tournament) => {
    if (!user?.id) {
      showError('Error de autenticación', 'Debes estar logueado para inscribirte');
      return;
    }

    if (!hasRole('PLAYER')) {
      showError('Permisos insuficientes', 'Solo los jugadores pueden inscribirse en torneos');
      return;
    }

    if (tournament.state !== 'PROGRAMMED') {
      showError('Torneo no disponible', 'Solo puedes inscribirte en torneos próximos');
      return;
    }

    if (tournament.current_players && tournament.max_players && 
        tournament.current_players >= tournament.max_players) {
      showError('Torneo completo', 'Este torneo ya está completo');
      return;
    }

    try {
      setRegistering(tournament.id);
      await tournamentService.registerPlayerToTournament(tournament.id, user.id);
      
      // Actualizar la lista de torneos
      await fetchAvailableTournaments();
      
      // Mostrar mensaje de éxito
      success('¡Inscripción exitosa!', `Te has inscrito exitosamente en "${tournament.name}"`);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Error al inscribirse al torneo';
      showError('Error en la inscripción', errorMessage);
    } finally {
      setRegistering(null);
    }
  };

  // Verificar si el usuario puede registrarse en un torneo específico
  const canRegisterToTournament = (tournament: Tournament) => {
    if (!user) return false;
    if (!hasRole('PLAYER')) return false;
    if (tournament.state !== 'PROGRAMMED') return false;
    if (tournament.current_players && tournament.max_players && 
        tournament.current_players >= tournament.max_players) return false;
    // TODO: Verificar si el usuario ya está registrado
    return true;
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

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      upcoming: { color: 'bg-blue-100 text-blue-800', text: 'Próximo' },
      ongoing: { color: 'bg-green-100 text-green-800', text: 'En curso' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32"></div>
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
          onClick={fetchAvailableTournaments}
          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-8">
        <BsTrophy className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay torneos disponibles</h3>
        <p className="mt-1 text-sm text-gray-500">
          No hay torneos abiertos para inscripciones en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tournaments.map((tournament) => (
        <div key={tournament.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{tournament.name}</h3>
                {getStatusBadge(tournament.state)}
              </div>
              
              {tournament.description && (
                <p className="text-gray-600 mb-3 text-sm">{tournament.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  📅
                  <span className="ml-2">
                    {formatDate(tournament.date)}
                    {tournament.start_time && (
                      <span className="ml-2">{formatTime(tournament.start_time)}</span>
                    )}
                  </span>
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

              {tournament.entry_fee && (
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Costo de entrada:</span> ${tournament.entry_fee}
                </div>
              )}
            </div>

            <div className="ml-6">
              {canRegisterToTournament(tournament) && (
                <button
                  onClick={() => handleRegistration(tournament)}
                  disabled={registering === tournament.id}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    registering === tournament.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } transition-colors`}
                >
                  {registering === tournament.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Inscribiendo...
                    </>
                  ) : (
                    <>
                      <BsCheckCircle className="h-4 w-4 mr-2" />
                      Inscribirse
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

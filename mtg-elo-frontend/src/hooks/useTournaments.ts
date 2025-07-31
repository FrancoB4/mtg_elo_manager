import { useState, useEffect, useRef } from 'react';
import tournamentService, { Tournament } from '../services/tournamentService';

interface UseTournamentsParams {
  page?: number;
  status?: string;
  format?: string;
  search?: string;
  ordering?: string;
}

export const useTournaments = (params: UseTournamentsParams = {}) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  // Para evitar dobles consultas en StrictMode
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      // Cancelar consulta anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Crear nuevo AbortController para esta consulta
      abortControllerRef.current = new AbortController();
      
      try {
        setLoading(true);
        setError('');

        const response = await tournamentService.getTournaments(params);
        
        // Verificar si la operación fue cancelada
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        
        // Verificar si la respuesta es un array simple o formato paginado
        if (Array.isArray(response)) {
          // Respuesta es un array simple
          setTournaments(response || []);
          setTotalCount(response.length || 0);
          setHasNext(false);
          setHasPrevious(false);
        } else {
          // Respuesta es formato paginado
          setTournaments(response.results || []);
          setTotalCount(response.count || 0);
          setHasNext(!!response.next);
          setHasPrevious(!!response.previous);
        }
      } catch (error) {
        // No mostrar error si fue cancelado
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        
        console.error('Error fetching tournaments:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar los torneos');
        // En caso de error, establecer valores por defecto
        setTournaments([]);
        setTotalCount(0);
        setHasNext(false);
        setHasPrevious(false);
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTournaments();
    
    // Cleanup function para cancelar consulta si el componente se desmonta
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.status, params.format, params.search, params.ordering]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await tournamentService.getTournaments(params);
      
      // Verificar si la respuesta es un array simple o formato paginado
      if (Array.isArray(response)) {
        // Respuesta es un array simple
        setTournaments(response || []);
        setTotalCount(response.length || 0);
        setHasNext(false);
        setHasPrevious(false);
      } else {
        // Respuesta es formato paginado
        setTournaments(response.results || []);
        setTotalCount(response.count || 0);
        setHasNext(!!response.next);
        setHasPrevious(!!response.previous);
      }
    } catch (error) {
      console.error('Error refetching tournaments:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los torneos');
      setTournaments([]);
      setTotalCount(0);
      setHasNext(false);
      setHasPrevious(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    tournaments,
    loading,
    error,
    totalCount,
    hasNext,
    hasPrevious,
    refetch,
  };
};

export const useTournament = (id: number) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    const fetchTournament = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await tournamentService.getTournament(id);
        setTournament(response);
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar el torneo');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const refetch = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await tournamentService.getTournament(id);
      setTournament(response);
    } catch (error) {
      console.error('Error refetching tournament:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar el torneo');
    } finally {
      setLoading(false);
    }
  };

  return {
    tournament,
    loading,
    error,
    refetch,
  };
};

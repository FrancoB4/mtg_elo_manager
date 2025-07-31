import { useState, useEffect, useRef } from 'react';
import tournamentService, { Tournament, TournamentStanding, Match, RoundMatches } from '../services/tournamentService';

interface UseTournamentDetailParams {
  tournamentId: number;
}

interface UseTournamentDetailReturn {
  tournament: Tournament | null;
  standings: TournamentStanding[];
  matches: Match[];
  roundMatches: RoundMatches[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTournamentDetail = (params: UseTournamentDetailParams): UseTournamentDetailReturn => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<TournamentStanding[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Obtener datos en paralelo
      const [tournamentData, standingsData, matchesData] = await Promise.all([
        tournamentService.getTournamentDetail(params.tournamentId),
        tournamentService.getTournamentStandings(params.tournamentId),
        tournamentService.getTournamentMatches(params.tournamentId),
      ]);

      setTournament(tournamentData);
      setStandings(standingsData);
      setMatches(matchesData);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching tournament data:', error);
        setError(error.message || 'Error al cargar los datos del torneo');
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchTournamentData();
  };

  // Agrupar matches por ronda
  const roundMatches: RoundMatches[] = matches.reduce((acc: RoundMatches[], match: Match) => {
    const existingRound = acc.find(r => r.round === match.round);
    if (existingRound) {
      existingRound.matches.push(match);
    } else {
      acc.push({
        round: match.round,
        matches: [match]
      });
    }
    return acc;
  }, []).sort((a, b) => a.round - b.round);

  useEffect(() => {
    fetchTournamentData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.tournamentId]);

  return {
    tournament,
    standings,
    matches,
    roundMatches,
    loading,
    error,
    refetch,
  };
};

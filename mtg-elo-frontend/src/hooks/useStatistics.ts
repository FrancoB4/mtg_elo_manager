import { useState, useEffect } from 'react';
import statisticsService, { GlobalStatistics } from '../services/statisticsService';

interface UseStatisticsReturn {
  statistics: GlobalStatistics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStatistics = (): UseStatisticsReturn => {
  const [statistics, setStatistics] = useState<GlobalStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statisticsService.getGlobalStatistics();
      setStatistics(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const refetch = async () => {
    await fetchStatistics();
  };

  return {
    statistics,
    loading,
    error,
    refetch,
  };
};

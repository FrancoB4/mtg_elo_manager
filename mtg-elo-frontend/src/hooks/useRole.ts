import { useAuth } from './authHook';

export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role) || user.is_superuser;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user || !user.roles) return false;
    return roles.some(role => hasRole(role)) || user.is_superuser;
  };

  const canCreateTournaments = (): boolean => {
    return hasAnyRole(['tournament_administrator', 'league_administrator']);
  };

  return {
    hasRole,
    hasAnyRole,
    canCreateTournaments,
    user
  };
};

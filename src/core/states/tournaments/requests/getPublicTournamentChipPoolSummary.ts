import { securedFetch } from '@/core/utils/misc/securedFetch';
import { Environment } from '../../environment/Environment';
import { TournamentChipPoolSummary } from './getTournamentChipPoolSummary';

export const getPublicTournamentChipPoolSummary = async (
  environment: Environment,
  tournamentId: string,
): Promise<TournamentChipPoolSummary | null> => {
  const id = tournamentId.trim();
  if (!id) return null;

  return securedFetch<undefined, TournamentChipPoolSummary | null>({
    method: 'GET',
    host: environment.apiUrl,
    path: `/v2/public/tournaments/${encodeURIComponent(id)}/chip-pool-summary`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      401: () => null,
      404: () => null,
      500: () => null,
      unknownError: () => null,
    },
  });
};

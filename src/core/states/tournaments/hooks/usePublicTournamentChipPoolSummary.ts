import { queryState } from '@/core/stateManager/factories/queryState';
import { useEnvironment } from '@/core/states/environment/useEnvironment';
import { getPublicTournamentChipPoolSummary } from '../requests/getPublicTournamentChipPoolSummary';
import { TournamentChipPoolSummary } from '../requests/getTournamentChipPoolSummary';

export const usePublicTournamentChipPoolSummary = queryState({
  request: async (
    { environment },
    _1,
    _2,
    tournamentId: string,
  ): Promise<TournamentChipPoolSummary | null> => {
    return getPublicTournamentChipPoolSummary(environment, tournamentId);
  },
  pollInterval: 5_000,
  cache: true,
  deps: {
    environment: useEnvironment,
  },
});

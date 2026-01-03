import { queryState } from '@/core/stateManager/factories/queryState';
import { useEnvironment } from '@/core/states/environment/useEnvironment';
import { Environment } from '@/core/states/environment/Environment';
import { Tournament, TournamentStatus } from './types';

export const getTournamentsList = async (
  environment: Environment,
  status?: TournamentStatus,
): Promise<Tournament[]> => {
  const url = new URL(`${environment.apiUrl}/v1/tournaments/list`);
  if (status) {
    url.searchParams.set('tournament-status', status);
  }

  const response = await fetch(url.toString());

  if (response.ok) {
    const data: Tournament[] = await response.json();
    return data;
  } else {
    return [];
  }
};

export const useTournamentsList = (status?: TournamentStatus) =>
  queryState({
    request: async ({ environment }): Promise<Tournament[]> => {
      return getTournamentsList(environment, status);
    },
    pollInterval: 30_000,
    cache: true,
    deps: {
      environment: useEnvironment,
    },
  });


import { queryState } from '@/core/stateManager/factories/queryState';
import { useEnvironment } from '@/core/states/environment/useEnvironment';
import { Environment } from '@/core/states/environment/Environment';
import { TournamentStructure } from './types';

export const getTournamentStructures = async (
  environment: Environment,
): Promise<TournamentStructure[]> => {
  const response = await fetch(
    `${environment.apiUrl}/v1/tournaments-structure/list`,
  );

  if (response.ok) {
    const data: TournamentStructure[] = await response.json();
    return data;
  } else {
    return [];
  }
};

export const getTournamentStructure = async (
  environment: Environment,
  id: number,
): Promise<TournamentStructure | null> => {
  const url = new URL(`${environment.apiUrl}/v1/tournaments-structure/get`);
  url.searchParams.set('id', id.toString());

  const response = await fetch(url.toString());

  if (response.ok) {
    const data: TournamentStructure = await response.json();
    return data;
  } else {
    return null;
  }
};

export const useTournamentStructures = () =>
  queryState({
    request: async ({ environment }): Promise<TournamentStructure[]> => {
      return getTournamentStructures(environment);
    },
    pollInterval: 60_000,
    cache: true,
    deps: {
      environment: useEnvironment,
    },
  });

export const useTournamentStructure = (id: number) =>
  queryState({
    request: async ({ environment }): Promise<TournamentStructure | null> => {
      return getTournamentStructure(environment, id);
    },
    pollInterval: undefined,
    cache: true,
    deps: {
      environment: useEnvironment,
    },
  });


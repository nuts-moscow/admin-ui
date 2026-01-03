import { queryState } from '@/core/stateManager/factories/queryState';
import { useEnvironment } from '@/core/states/environment/useEnvironment';
import { Environment } from '@/core/states/environment/Environment';
import { TournamentStructure } from './types';
import { securedFetch } from '@/core/utils/misc/securedFetch';

export const getTournamentStructures = async (
  environment: Environment,
): Promise<TournamentStructure[]> => {
  return securedFetch<undefined, TournamentStructure[]>({
    method: 'GET',
    host: environment.apiUrl,
    path: '/v1/tournaments-structure/list',
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  });
};

export const getTournamentStructure = async (
  environment: Environment,
  id: number,
): Promise<TournamentStructure | null> => {
  return securedFetch<undefined, TournamentStructure | null>({
    method: 'GET',
    host: environment.apiUrl,
    path: `/v1/tournaments-structure/get?id=${id}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => null,
      404: () => null,
      500: () => null,
      unknownError: () => null,
    },
  });
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


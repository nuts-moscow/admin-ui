import { queryState } from '@/core/stateManager/factories/queryState';
import { useEnvironment } from '@/core/states/environment/useEnvironment';
import { Environment } from '@/core/states/environment/Environment';
import { InGamePlayerState, UpdatePlayerStateRequest } from './types';
import { securedFetch } from '@/core/utils/misc/securedFetch';

export const getPlayerState = async (
  environment: Environment,
  tournamentId: string,
): Promise<InGamePlayerState[]> => {
  return securedFetch<undefined, InGamePlayerState[]>({
    method: 'GET',
    host: environment.apiUrl,
    path: `/v1/tournaments/get-tournament-player-state?tournamentId=${tournamentId}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => [],
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  });
};

export const updatePlayerState = async (
  environment: Environment,
  request: UpdatePlayerStateRequest,
): Promise<InGamePlayerState> => {
  return securedFetch<UpdatePlayerStateRequest, InGamePlayerState>({
    method: 'POST',
    host: environment.apiUrl,
    path: '/v1/tournaments/update-player-state',
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error('Invalid player state data'),
      404: () => new Error('Player or tournament not found'),
      500: () => new Error('Server error'),
    },
  });
};

export const usePlayerState = (tournamentId: string) =>
  queryState({
    request: async ({ environment }): Promise<InGamePlayerState[]> => {
      return getPlayerState(environment, tournamentId);
    },
    pollInterval: 10_000,
    cache: true,
    deps: {
      environment: useEnvironment,
    },
  });


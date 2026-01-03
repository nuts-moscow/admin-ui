import { queryState } from '@/core/stateManager/factories/queryState';
import { useEnvironment } from '@/core/states/environment/useEnvironment';
import { Environment } from '@/core/states/environment/Environment';
import { InGamePlayerState, UpdatePlayerStateRequest } from './types';

export const getPlayerState = async (
  environment: Environment,
  tournamentId: string,
): Promise<InGamePlayerState[]> => {
  const url = new URL(
    `${environment.apiUrl}/v1/tournaments/get-tournament-player-state`,
  );
  url.searchParams.set('tournamentId', tournamentId);

  const response = await fetch(url.toString());

  if (response.ok) {
    const data: InGamePlayerState[] = await response.json();
    return data;
  } else {
    return [];
  }
};

export const updatePlayerState = async (
  environment: Environment,
  request: UpdatePlayerStateRequest,
): Promise<InGamePlayerState> => {
  const response = await fetch(
    `${environment.apiUrl}/v1/tournaments/update-player-state`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    },
  );

  if (response.ok) {
    const data: InGamePlayerState = await response.json();
    return data;
  } else {
    throw new Error(`Failed to update player state: ${response.statusText}`);
  }
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


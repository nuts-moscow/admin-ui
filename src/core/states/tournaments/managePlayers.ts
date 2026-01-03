import { Environment } from '@/core/states/environment/Environment';

export const addPlayerToTournament = async (
  environment: Environment,
  tournamentId: string,
  playerId: number,
): Promise<object> => {
  const url = new URL(
    `${environment.apiUrl}/v1/tournaments/add-player-to-tournament`,
  );
  url.searchParams.set('tournamentId', tournamentId);
  url.searchParams.set('playerId', playerId.toString());

  const response = await fetch(url.toString(), {
    method: 'POST',
  });

  if (response.ok) {
    const data: object = await response.json();
    return data;
  } else {
    throw new Error(`Failed to add player to tournament: ${response.statusText}`);
  }
};

export const removePlayerFromTournament = async (
  environment: Environment,
  tournamentId: string,
  playerId: number,
): Promise<object> => {
  const url = new URL(
    `${environment.apiUrl}/v1/tournaments/remove-player-from-tournament`,
  );
  url.searchParams.set('tournamentId', tournamentId);
  url.searchParams.set('playerId', playerId.toString());

  const response = await fetch(url.toString(), {
    method: 'DELETE',
  });

  if (response.ok) {
    const data: object = await response.json();
    return data;
  } else {
    throw new Error(
      `Failed to remove player from tournament: ${response.statusText}`,
    );
  }
};


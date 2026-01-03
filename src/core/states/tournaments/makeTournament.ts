import { Environment } from '@/core/states/environment/Environment';
import { MakeTournamentRequest, Tournament } from './types';

export const makeTournament = async (
  environment: Environment,
  request: MakeTournamentRequest,
): Promise<Tournament[]> => {
  const response = await fetch(`${environment.apiUrl}/v1/tournaments/make`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (response.ok) {
    const data: Tournament[] = await response.json();
    return data;
  } else {
    throw new Error(`Failed to make tournament: ${response.statusText}`);
  }
};


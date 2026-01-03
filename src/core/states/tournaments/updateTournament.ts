import { Environment } from '@/core/states/environment/Environment';
import { UpdateTournamentRequest, Tournament } from './types';

export const updateTournament = async (
  environment: Environment,
  request: UpdateTournamentRequest,
): Promise<Tournament[]> => {
  const response = await fetch(`${environment.apiUrl}/v1/tournaments/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (response.ok) {
    const data: Tournament[] = await response.json();
    return data;
  } else {
    throw new Error(`Failed to update tournament: ${response.statusText}`);
  }
};


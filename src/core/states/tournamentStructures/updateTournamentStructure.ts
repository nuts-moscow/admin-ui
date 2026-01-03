import { Environment } from '@/core/states/environment/Environment';
import { UpdateTournamentStructureRequest, TournamentStructure } from './types';

export const updateTournamentStructure = async (
  environment: Environment,
  request: UpdateTournamentStructureRequest,
): Promise<TournamentStructure[]> => {
  const response = await fetch(
    `${environment.apiUrl}/v1/tournaments-structure/update`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    },
  );

  if (response.ok) {
    const data: TournamentStructure[] = await response.json();
    return data;
  } else {
    throw new Error(
      `Failed to update tournament structure: ${response.statusText}`,
    );
  }
};


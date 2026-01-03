import { Environment } from '@/core/states/environment/Environment';
import { MakeTournamentStructureRequest, TournamentStructure } from './types';

export const makeTournamentStructure = async (
  environment: Environment,
  request: MakeTournamentStructureRequest,
): Promise<TournamentStructure[]> => {
  const response = await fetch(
    `${environment.apiUrl}/v1/tournaments-structure/make`,
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
      `Failed to make tournament structure: ${response.statusText}`,
    );
  }
};


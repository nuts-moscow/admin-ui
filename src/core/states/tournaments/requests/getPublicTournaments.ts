import { normalizeTournamentStatus } from '../common/TournamentStatus';
import { ShortTournament } from './getTournaments';

interface PublicTournamentResponseItem {
  readonly id: number;
  readonly name: string;
  readonly status: string;
  readonly date: string | number;
}

function toTimestamp(date: string | number): number {
  if (typeof date === 'number') return date;
  return new Date(date).getTime();
}

export const getPublicTournaments = async (
  apiUrl: string,
): Promise<ShortTournament[]> => {
  try {
    const response = await fetch(`${apiUrl}/v2/public/tournaments`, {
      credentials: 'omit',
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    const items: PublicTournamentResponseItem[] =
      Array.isArray(data)
        ? (data as PublicTournamentResponseItem[])
        : data &&
            typeof data === 'object' &&
            'tournaments' in data &&
            Array.isArray((data as { tournaments: unknown }).tournaments)
          ? ((data as { tournaments: PublicTournamentResponseItem[] })
              .tournaments)
          : [];
    return items.map((t) => ({
      id: String(t.id),
      name: t.name,
      status: normalizeTournamentStatus(t.status),
      date: toTimestamp(t.date),
    }));
  } catch {
    return [];
  }
};

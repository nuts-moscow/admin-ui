import { securedFetch } from '@/core/utils/misc/securedFetch';
import { Environment } from '../../environment/Environment';
import {
  tryParseTournamentClockTick,
  type TournamentClockTick,
} from '../common/TournamentClockTick';

/**
 * GET /v2/public/tournaments/{id}/clock — публичный снимок часов без авторизации.
 */
export const getPublicTournamentClock = async (
  environment: Environment,
  tournamentId: number | string,
): Promise<TournamentClockTick | null> => {
  const tid = encodeURIComponent(String(tournamentId).trim());
  if (!tid) return null;

  return securedFetch<undefined, unknown, TournamentClockTick | null>({
    method: 'GET',
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tid}/clock`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: async (res) => {
        const raw = await res.toJson().catch(() => null);
        return raw ? tryParseTournamentClockTick(raw) : null;
      },
      401: () => null,
      404: () => null,
      unknownError: () => null,
    },
  });
};

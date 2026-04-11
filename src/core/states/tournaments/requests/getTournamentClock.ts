import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import {
  tryParseTournamentClockTick,
  type TournamentClockTick,
} from "../common/TournamentClockTick";

/**
 * GET /v2/api/tournaments/{id}/clock — снимок часов (тот же JSON, что и тик WebSocket).
 */
export const getTournamentClock = async (
  environment: Environment,
  tournamentId: number | string
): Promise<TournamentClockTick | null> => {
  const tid = encodeURIComponent(String(tournamentId).trim());
  if (!tid) return null;

  return securedFetch<undefined, unknown, TournamentClockTick | null>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tid}/clock`,
    withCredentials: true,
    body: undefined,
    mapping: {
      success: async (res) => {
        const raw = await res.toJson().catch(() => null);
        return raw ? tryParseTournamentClockTick(raw) : null;
      },
      404: () => null,
      unknownError: () => null,
    },
  });
};

import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { InGamePlayerState } from "../common/InGamePlayerState";
import { normalizeRatingBreakdown } from "../common/TournamentRatingBreakdown";

function normalizePlayersPayload(raw: unknown): InGamePlayerState[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => {
    if (item == null || typeof item !== "object") {
      return item as InGamePlayerState;
    }
    const p = item as InGamePlayerState & { rating?: unknown };
    const ratingNorm = normalizeRatingBreakdown(p.rating);
    if (ratingNorm != null) {
      return { ...p, rating: ratingNorm };
    }
    const { rating: _drop, ...rest } = p;
    return rest as InGamePlayerState;
  });
}

export const getTournamentPlayerState = async (
  environment: Environment,
  tournamentId: string,
): Promise<InGamePlayerState[]> => {
  return securedFetch<undefined, InGamePlayerState[]>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: async (res) => normalizePlayersPayload(await res.toJson()),
      400: () => [],
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  });
};

import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { InGamePlayerState } from "../common/InGamePlayerState";
import { normalizeRatingBreakdown } from "../common/TournamentRatingBreakdown";

function pickRatingNonPlacementAccrued(
  raw: Record<string, unknown>,
): number | undefined {
  const v =
    raw.ratingNonPlacementAccrued ?? raw.rating_non_placement_accrued;
  if (typeof v === "number" && Number.isFinite(v)) {
    return v;
  }
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) {
      return n;
    }
  }
  return undefined;
}

/** Один объект игрока из ответа API (например PATCH). */
export function normalizeTournamentPlayerItem(
  item: unknown,
): InGamePlayerState | null {
  if (item == null || typeof item !== "object") {
    return null;
  }
  const [first] = normalizePlayersPayload([item]);
  return first ?? null;
}

function normalizePlayersPayload(raw: unknown): InGamePlayerState[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => {
    if (item == null || typeof item !== "object") {
      return item as InGamePlayerState;
    }
    const p = item as InGamePlayerState & { rating?: unknown };
    const rawRec = item as Record<string, unknown>;
    const ratingNorm = normalizeRatingBreakdown(p.rating);
    const accruedTop = pickRatingNonPlacementAccrued(rawRec);
    const base =
      ratingNorm != null
        ? { ...p, rating: ratingNorm }
        : (() => {
            const { rating: _drop, ...rest } = p;
            return rest as InGamePlayerState;
          })();
    if (accruedTop != null) {
      return { ...base, ratingNonPlacementAccrued: accruedTop };
    }
    return base;
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
    withCredentials: true,
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

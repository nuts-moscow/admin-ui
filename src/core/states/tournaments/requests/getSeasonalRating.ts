import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface SeasonalRatingEntry {
  readonly playerId: string;
  readonly totalPoints: number;
  readonly tournamentCount: number;
}

export interface SeasonalRatingResponse {
  readonly year: number;
  readonly month: number;
  readonly entries: readonly SeasonalRatingEntry[];
}

function normalizeEntry(raw: unknown): SeasonalRatingEntry | null {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const playerId = String(o.playerId ?? o.player_id ?? "");
  const totalPoints = Number(o.totalPoints ?? o.total_points);
  const tournamentCount = Number(o.tournamentCount ?? o.tournament_count);
  if (!playerId || !Number.isFinite(totalPoints) || !Number.isFinite(tournamentCount)) {
    return null;
  }
  return {
    playerId,
    totalPoints,
    tournamentCount: Math.trunc(tournamentCount),
  };
}

function normalizeResponse(raw: unknown): SeasonalRatingResponse | null {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const year = Number(o.year);
  const month = Number(o.month);
  const ent = o.entries;
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Array.isArray(ent)) {
    return null;
  }
  const entries = ent
    .map(normalizeEntry)
    .filter((e): e is SeasonalRatingEntry => e != null);
  return {
    year: Math.trunc(year),
    month: Math.trunc(month),
    entries,
  };
}

/**
 * GET /v2/api/seasonal-rating?year=&month=
 */
export async function getSeasonalRating(
  environment: Environment,
  year: number,
  month: number,
): Promise<SeasonalRatingResponse | null> {
  const y = Math.trunc(year);
  const m = Math.trunc(month);
  const params = new URLSearchParams();
  params.set("year", String(y));
  params.set("month", String(m));

  return securedFetch<undefined, SeasonalRatingResponse | null>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v2/api/seasonal-rating?${params.toString()}`,
    withCredentials: true,
    body: undefined,
    mapping: {
      success: async (res) => normalizeResponse(await res.toJson()),
      400: () => null,
      401: () => null,
      404: () => null,
      500: () => null,
      unknownError: () => null,
    },
  });
}

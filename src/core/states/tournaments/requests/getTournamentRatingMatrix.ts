import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface RatingMatrixPlace {
  readonly place: number;
  /** 26 значений — по одному на каждый диапазон участников. */
  readonly basePoints: readonly number[];
}

export interface TournamentRatingMatrix {
  /** 26 меток вида "20-21", "22-23", … */
  readonly participantRangeLabels: readonly string[];
  /** 35 строк (место 1–35). */
  readonly places: readonly RatingMatrixPlace[];
}

function normalizeMatrix(raw: unknown): TournamentRatingMatrix | null {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const labelsRaw =
    o.participantRangeLabels ?? o.participant_range_labels;
  const placesRaw = o.places;
  if (!Array.isArray(labelsRaw) || !Array.isArray(placesRaw)) {
    return null;
  }
  const participantRangeLabels = labelsRaw.map((l) => String(l));
  const places: RatingMatrixPlace[] = [];
  for (const row of placesRaw) {
    if (row == null || typeof row !== "object") {
      return null;
    }
    const r = row as Record<string, unknown>;
    const placeRaw = r.place;
    const place =
      typeof placeRaw === "number"
        ? placeRaw
        : typeof placeRaw === "string"
          ? Number(placeRaw)
          : NaN;
    const bp = r.basePoints ?? r.base_points;
    if (!Number.isFinite(place) || !Array.isArray(bp)) {
      return null;
    }
    const basePoints = bp.map((x) => {
      const n = Number(x);
      return Number.isFinite(n) ? n : NaN;
    });
    if (basePoints.some((n) => !Number.isFinite(n))) {
      return null;
    }
    places.push({ place: Math.trunc(place), basePoints });
  }
  if (participantRangeLabels.length === 0 || places.length === 0) {
    return null;
  }
  return { participantRangeLabels, places };
}

/**
 * Индекс столбца матрицы для заданного числа участников.
 * col = clamp(floor((n - 20) / 2), 0, 25)
 */
export function matrixColumnIndex(participantCount: number): number {
  return Math.max(0, Math.min(25, Math.floor((participantCount - 20) / 2)));
}

const MATRIX_PATHS = [
  "/v2/api/tournament-rating-matrix",
  "/api/tournament-rating-matrix",
] as const;

async function fetchMatrixOnce(
  environment: Environment,
  path: string,
): Promise<TournamentRatingMatrix | null> {
  return securedFetch<undefined, TournamentRatingMatrix | null>({
    method: "GET",
    host: environment.apiUrl,
    path,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: async (res) => {
        const raw = await res.toJson();
        return normalizeMatrix(raw);
      },
      404: () => null,
      500: () => null,
      unknownError: () => null,
    },
  });
}

export const getTournamentRatingMatrix = async (
  environment: Environment,
): Promise<TournamentRatingMatrix | null> => {
  for (const path of MATRIX_PATHS) {
    const result = await fetchMatrixOnce(environment, path);
    if (result != null) {
      return result;
    }
  }
  return null;
};

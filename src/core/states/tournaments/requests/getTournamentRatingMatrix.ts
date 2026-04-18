import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface RatingMatrixPlace {
  readonly place: number;
  /** Значения по столбцам; null — «нет баллов», для отображения как прочерк / 0 по правилам UI. */
  readonly basePoints: readonly (number | null)[];
}

export interface TournamentRatingMatrix {
  readonly columnRangeStart: number;
  readonly participantRangeLabels: readonly string[];
  readonly places: readonly RatingMatrixPlace[];
}

function buildRangeLabels(columnRangeStart: number, columnCount: number): string[] {
  return Array.from({ length: columnCount }, (_, j) => {
    const lo = columnRangeStart + j * 2;
    const hi = columnRangeStart + j * 2 + 1;
    return `${lo}-${hi}`;
  });
}

function pickFiniteInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) {
    return Math.trunc(v);
  }
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) {
      return Math.trunc(n);
    }
  }
  return null;
}

/** Снимает обёртки вида { data: {...} } у ответа GET /api/rating-tables/:id. */
function unwrapRatingTablePayload(raw: unknown): unknown {
  if (raw == null || typeof raw !== "object") {
    return raw;
  }
  const o = raw as Record<string, unknown>;
  const data = o.data ?? o.ratingTable ?? o.table;
  if (data != null && typeof data === "object") {
    return data;
  }
  return raw;
}

/** Нормализация ответа GET /api/rating-tables/:id с полем matrix. */
function normalizeFromMatrixPayload(raw: unknown): TournamentRatingMatrix | null {
  const unwrapped = unwrapRatingTablePayload(raw);
  if (unwrapped == null || typeof unwrapped !== "object") {
    return null;
  }
  const o = unwrapped as Record<string, unknown>;
  const matrixRaw = o.matrix;
  const crsRaw = o.columnRangeStart ?? o.column_range_start;
  const crs = pickFiniteInt(crsRaw);
  if (!Array.isArray(matrixRaw) || crs == null) {
    return null;
  }
  const columnRangeStart = crs;
  const places: RatingMatrixPlace[] = [];
  for (let i = 0; i < matrixRaw.length; i++) {
    const row = matrixRaw[i];
    if (!Array.isArray(row)) {
      return null;
    }
    const basePoints = row.map((cell) => {
      if (cell === null || cell === undefined) {
        return null;
      }
      const n = Number(cell);
      return Number.isFinite(n) ? n : null;
    });
    places.push({ place: i + 1, basePoints });
  }
  if (places.length === 0) {
    return null;
  }
  const width = places[0]!.basePoints.length;
  if (width === 0) {
    return null;
  }
  if (!places.every((p) => p.basePoints.length === width)) {
    return null;
  }
  return {
    columnRangeStart,
    participantRangeLabels: buildRangeLabels(columnRangeStart, width),
    places,
  };
}

/** Старый формат GET /api/tournament-rating-matrix (places + метки). */
function normalizeLegacyMatrix(raw: unknown): TournamentRatingMatrix | null {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const labelsRaw = o.participantRangeLabels ?? o.participant_range_labels;
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
      if (x === null || x === undefined) {
        return null;
      }
      const n = Number(x);
      return Number.isFinite(n) ? n : null;
    });
    places.push({ place: Math.trunc(place), basePoints });
  }
  if (participantRangeLabels.length === 0 || places.length === 0) {
    return null;
  }
  const inferredStart = inferColumnRangeStart(participantRangeLabels);
  return {
    columnRangeStart: inferredStart,
    participantRangeLabels,
    places,
  };
}

function inferColumnRangeStart(labels: readonly string[]): number {
  const first = labels[0];
  const m = first?.match(/^(\d+)/);
  if (m) {
    return Number.parseInt(m[1]!, 10);
  }
  return 20;
}

const LEGACY_MATRIX_PATHS = [
  "/v2/api/tournament-rating-matrix",
  "/api/tournament-rating-matrix",
  "/v1/api/tournament-rating-matrix",
] as const;

/**
 * Матрица по id: v2 → /api → v1 → /matrix → legacy с query ratingTableId.
 */
const RATING_TABLE_MATRIX_PATHS = (id: string | number) => {
  const s = String(id).trim();
  const q = encodeURIComponent(s);
  return [
    `/v2/api/rating-tables/${s}`,
    `/v2/api/rating-tables/${s}/matrix`,
    `/api/rating-tables/${s}/matrix`,
    `/api/rating-tables/${s}`,
    `/v1/api/rating-tables/${s}`,
    `/v1/api/rating-tables/${s}/matrix`,
    `/v2/api/tournament-rating-matrix?ratingTableId=${q}`,
    `/api/tournament-rating-matrix?ratingTableId=${q}`,
    `/v1/api/tournament-rating-matrix?ratingTableId=${q}`,
  ] as const;
};

function normalizeRatingTableMatrixResponse(raw: unknown): TournamentRatingMatrix | null {
  const unwrapped = unwrapRatingTablePayload(raw);
  return (
    normalizeFromMatrixPayload(raw) ??
    normalizeLegacyMatrix(unwrapped) ??
    normalizeLegacyMatrix(raw)
  );
}

async function fetchRatingTableMatrixOnce(
  environment: Environment,
  path: string,
): Promise<TournamentRatingMatrix | null> {
  return securedFetch<undefined, TournamentRatingMatrix | null>({
    method: "GET",
    host: environment.apiUrl,
    path,
    withCredentials: true,
    body: undefined,
    mapping: {
      success: async (res) => {
        const raw = await res.toJson();
        return normalizeRatingTableMatrixResponse(raw);
      },
      404: () => null,
      500: () => null,
      unknownError: () => null,
    },
  });
}

/**
 * Матрица для таблицы рейтинга по id (см. RATING_TABLE_MATRIX_PATHS — несколько совместимых URL).
 */
export const getRatingTableMatrix = async (
  environment: Environment,
  tableId: string | number,
): Promise<TournamentRatingMatrix | null> => {
  const id = String(tableId).trim();
  if (!id) {
    return null;
  }
  for (const path of RATING_TABLE_MATRIX_PATHS(id)) {
    const result = await fetchRatingTableMatrixOnce(environment, path);
    if (result != null) {
      return result;
    }
  }
  return null;
};

async function fetchLegacyMatrixOnce(
  environment: Environment,
  path: string,
): Promise<TournamentRatingMatrix | null> {
  return securedFetch<undefined, TournamentRatingMatrix | null>({
    method: "GET",
    host: environment.apiUrl,
    path,
    withCredentials: true,
    body: undefined,
    mapping: {
      success: async (res) => {
        const raw = await res.toJson();
        return normalizeRatingTableMatrixResponse(raw);
      },
      404: () => null,
      500: () => null,
      unknownError: () => null,
    },
  });
}

/**
 * Устаревший глобальный эндпоинт матрицы (без id таблицы).
 */
export const getTournamentRatingMatrix = async (
  environment: Environment,
): Promise<TournamentRatingMatrix | null> => {
  for (const path of LEGACY_MATRIX_PATHS) {
    const result = await fetchLegacyMatrixOnce(environment, path);
    if (result != null) {
      return result;
    }
  }
  return null;
};

/**
 * Индекс столбца для числа участников: диапазон колонки j —
 * [columnRangeStart + j*2 … columnRangeStart + j*2 + 1].
 */
export function matrixColumnIndex(
  participantCount: number,
  columnRangeStart: number,
  columnCount: number,
): number {
  if (columnCount <= 0) {
    return 0;
  }
  if (participantCount <= 0) {
    return 0;
  }
  const j = Math.floor((participantCount - columnRangeStart) / 2);
  return Math.max(0, Math.min(columnCount - 1, j));
}

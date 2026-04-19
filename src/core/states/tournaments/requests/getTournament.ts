import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import {
  TournamentStatus,
  normalizeTournamentStatus,
} from "../common/TournamentStatus";
import { TournamentsStructureResponse } from "../common/TournamentsStructureResponse";

export interface TournamentInfoResponse {
  readonly id: number;
  readonly name: string;
  readonly status: TournamentStatus;
  readonly date: number;
  readonly structure?: TournamentsStructureResponse;
  /** Если true — места 1–10 получают бонус к базе до умножения на коэффициент. */
  readonly ratingGuaranteeEnabled?: boolean;
  /** Баллов к базе для топ‑10 при включённой гарантии (по умолчанию на бэке 10). */
  readonly ratingGuaranteeBonusPoints?: number;
  /** Множитель для баллов за место. По умолчанию 1. */
  readonly ratingPointsCoefficient?: number;
  /** Множитель для баунти-баллов. По умолчанию 1. */
  readonly ratingBountyCoefficient?: number;
  /** Таблица рейтинга (справочник GET /api/rating-tables). */
  readonly ratingTableId?: number;
  /** Учёт в сезонном рейтинге; false — спецформат без очков. */
  readonly ratingEnabled?: boolean;
  readonly ratingSeasonYear?: number | null;
  readonly ratingSeasonMonth?: number | null;
}

export function pickFiniteNumber(...vals: unknown[]): number | undefined {
  for (const v of vals) {
    if (typeof v === "number" && Number.isFinite(v)) {
      return v;
    }
  }
  return undefined;
}

export function normalizeStructure(
  raw: TournamentsStructureResponse | null,
): TournamentsStructureResponse | undefined {
  if (!raw) {
    return undefined;
  }
  const s = raw as unknown as Record<string, unknown>;
  const entryPrice = pickFiniteNumber(s.entryPrice, s.entry_price);
  const reentryPrice = pickFiniteNumber(s.reentryPrice, s.reentry_price);
  const maxReentries = pickFiniteNumber(s.maxReentries, s.max_reentries);
  const allowedReentryCount = pickFiniteNumber(
    s.allowedReentryCount,
    s.allowed_reentry_count,
  );
  const entryFreeOnlyRaw = s.entryFreeOnly ?? s.entry_free_only;
  const entryFreeOnly =
    entryFreeOnlyRaw === true ||
    entryFreeOnlyRaw === "true" ||
    entryFreeOnlyRaw === 1;
  return {
    ...raw,
    ...(entryPrice != null ? { entryPrice } : {}),
    ...(reentryPrice != null ? { reentryPrice } : {}),
    ...(maxReentries != null ? { maxReentries } : {}),
    ...(allowedReentryCount != null ? { allowedReentryCount } : {}),
    entryFreeOnly,
  };
}

/** Ответ GET /v2/api/tournaments/{id} (TournamentWithStructureResponse). */
interface TournamentWithStructureResponse {
  readonly id: number;
  readonly name: string;
  readonly status: string;
  readonly date: number;
  readonly structure: TournamentsStructureResponse | null;
  readonly ratingGuaranteeEnabled?: boolean;
  readonly ratingGuaranteeBonusPoints?: number;
  readonly ratingPointsCoefficient?: number;
  readonly ratingBountyCoefficient?: number;
  readonly ratingTableId?: number;
  readonly ratingEnabled?: boolean;
  readonly ratingSeasonYear?: number | null;
  readonly ratingSeasonMonth?: number | null;
  readonly rating_enabled?: boolean;
  readonly rating_season_year?: number | null;
  readonly rating_season_month?: number | null;
}

/**
 * GET /v2/api/tournaments/{id} — турнир со структурой (structure может быть null).
 */
export const getTournament = async (
  environment: Environment,
  id: string
): Promise<TournamentInfoResponse | null> => {
  const tournamentId = id.trim();
  if (!tournamentId) return null;

  return securedFetch<undefined, TournamentInfoResponse | null>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${encodeURIComponent(tournamentId)}`,
    withCredentials: true,
    body: undefined,
    mapping: {
      success: async (res) => {
        const j = (await res.toJson()) as TournamentWithStructureResponse;
        const ratingTableIdRaw =
          (j as { ratingTableId?: unknown }).ratingTableId ??
          (j as { rating_table_id?: unknown }).rating_table_id;
        const ratingTableId =
          typeof ratingTableIdRaw === "number" && Number.isFinite(ratingTableIdRaw)
            ? Math.trunc(ratingTableIdRaw)
            : typeof ratingTableIdRaw === "string" &&
                ratingTableIdRaw.trim() !== "" &&
                Number.isFinite(Number(ratingTableIdRaw))
              ? Math.trunc(Number(ratingTableIdRaw))
              : undefined;
        const ratingEnabledRaw =
          (j as TournamentWithStructureResponse).ratingEnabled ??
          (j as TournamentWithStructureResponse).rating_enabled;
        const ratingEnabled =
          typeof ratingEnabledRaw === "boolean"
            ? ratingEnabledRaw
            : ratingEnabledRaw === "true"
              ? true
              : ratingEnabledRaw === "false"
                ? false
                : undefined;
        const jr = j as unknown as Record<string, unknown>;
        const rawY = jr.ratingSeasonYear ?? jr.rating_season_year;
        const rawM = jr.ratingSeasonMonth ?? jr.rating_season_month;
        let ratingSeasonYear: number | null | undefined;
        if (rawY === null) {
          ratingSeasonYear = null;
        } else if (rawY === undefined) {
          ratingSeasonYear = undefined;
        } else {
          const n = Number(rawY);
          ratingSeasonYear = Number.isFinite(n) ? Math.trunc(n) : undefined;
        }
        let ratingSeasonMonth: number | null | undefined;
        if (rawM === null) {
          ratingSeasonMonth = null;
        } else if (rawM === undefined) {
          ratingSeasonMonth = undefined;
        } else {
          const n = Number(rawM);
          ratingSeasonMonth = Number.isFinite(n)
            ? Math.min(12, Math.max(1, Math.trunc(n)))
            : undefined;
        }
        return {
          id: j.id,
          name: j.name,
          status: normalizeTournamentStatus(j.status),
          date: j.date,
          structure: normalizeStructure(j.structure),
          ratingGuaranteeEnabled: j.ratingGuaranteeEnabled,
          ratingGuaranteeBonusPoints: pickFiniteNumber(
            j.ratingGuaranteeBonusPoints,
            (j as { rating_guarantee_bonus_points?: unknown })
              .rating_guarantee_bonus_points,
          ),
          ratingPointsCoefficient: j.ratingPointsCoefficient,
          ratingBountyCoefficient: j.ratingBountyCoefficient,
          ...(ratingTableId != null ? { ratingTableId } : {}),
          ...(ratingEnabled !== undefined ? { ratingEnabled } : {}),
          ...(ratingSeasonYear !== undefined
            ? { ratingSeasonYear }
            : {}),
          ...(ratingSeasonMonth !== undefined
            ? { ratingSeasonMonth }
            : {}),
        };
      },
      404: () => null,
      unknownError: () => null,
    },
  });
};

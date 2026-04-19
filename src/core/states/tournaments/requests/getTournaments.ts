import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { pickFiniteNumber } from "./getTournament";
import {
  TournamentStatus,
  normalizeTournamentStatus,
} from "../common/TournamentStatus";

export interface ShortTournament {
  readonly id: string;
  readonly name: string;
  readonly status: TournamentStatus;
  readonly date: number;
  readonly ratingGuaranteeEnabled?: boolean;
  readonly ratingGuaranteeBonusPoints?: number;
  readonly ratingEnabled?: boolean;
  readonly ratingSeasonYear?: number | null;
  readonly ratingSeasonMonth?: number | null;
  readonly lateRegistrationClosed?: boolean;
}

/** Элемент ответа GET v2/api/tournaments (TournamentResponse). */
interface TournamentResponseItem {
  readonly id: number;
  readonly name: string;
  readonly status: string;
  readonly date: number;
  readonly ratingGuaranteeEnabled?: boolean;
  readonly ratingGuaranteeBonusPoints?: number;
  readonly rating_guarantee_enabled?: boolean;
  readonly rating_guarantee_bonus_points?: number;
  readonly ratingEnabled?: boolean;
  readonly rating_enabled?: boolean;
  readonly ratingSeasonYear?: number | null;
  readonly ratingSeasonMonth?: number | null;
  readonly rating_season_year?: number | null;
  readonly rating_season_month?: number | null;
  readonly lateRegistrationClosed?: boolean;
  readonly late_registration_closed?: boolean;
}

function toShortTournament(t: TournamentResponseItem): ShortTournament {
  const reRaw = t.ratingEnabled ?? t.rating_enabled;
  const ratingEnabled =
    typeof reRaw === "boolean"
      ? reRaw
      : reRaw === "true"
        ? true
        : reRaw === "false"
          ? false
          : undefined;
  const lateRaw = t.lateRegistrationClosed ?? t.late_registration_closed;
  const lateRegistrationClosed =
    typeof lateRaw === "boolean"
      ? lateRaw
      : lateRaw === "true"
        ? true
        : lateRaw === "false"
          ? false
          : undefined;
  const rawY = t.ratingSeasonYear ?? t.rating_season_year;
  const rawM = t.ratingSeasonMonth ?? t.rating_season_month;
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
    id: String(t.id),
    name: t.name,
    status: normalizeTournamentStatus(t.status),
    date: t.date,
    ...(t.ratingGuaranteeEnabled != null || t.rating_guarantee_enabled != null
      ? {
          ratingGuaranteeEnabled: Boolean(
            t.ratingGuaranteeEnabled ?? t.rating_guarantee_enabled,
          ),
        }
      : {}),
    ...(pickFiniteNumber(
      t.ratingGuaranteeBonusPoints,
      t.rating_guarantee_bonus_points,
    ) != null
      ? {
          ratingGuaranteeBonusPoints: pickFiniteNumber(
            t.ratingGuaranteeBonusPoints,
            t.rating_guarantee_bonus_points,
          ),
        }
      : {}),
    ...(ratingEnabled !== undefined ? { ratingEnabled } : {}),
    ...(ratingSeasonYear !== undefined ? { ratingSeasonYear } : {}),
    ...(ratingSeasonMonth !== undefined ? { ratingSeasonMonth } : {}),
    ...(lateRegistrationClosed !== undefined
      ? { lateRegistrationClosed }
      : {}),
  };
}

function toTournamentList(value: unknown): ShortTournament[] {
  const raw: TournamentResponseItem[] = [];
  if (Array.isArray(value)) {
    raw.push(...(value as TournamentResponseItem[]));
  } else if (
    value &&
    typeof value === "object" &&
    "tournaments" in value &&
    Array.isArray((value as { tournaments: unknown }).tournaments)
  ) {
    raw.push(...(value as { tournaments: TournamentResponseItem[] }).tournaments);
  }
  return raw.map(toShortTournament);
}

export interface GetTournamentsOptions {
  readonly offset?: number;
  readonly limit?: number;
}

export const getTournaments = async (
  environment: Environment,
  status?: TournamentStatus
): Promise<ShortTournament[]> => {
  const params = new URLSearchParams();
  params.set("limit", "1000");
  const path = `/v2/api/tournaments?${params.toString()}`;

  const list = await securedFetch<undefined, ShortTournament[]>({
    method: "GET",
    host: environment.apiUrl,
    path,
    withCredentials: true,
    body: undefined,
    mapping: {
      success: async (res) => toTournamentList(await res.toJson()),
      400: () => {
        throw new Error("Invalid query params");
      },
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  });

  if (status != null) {
    return list.filter((t) => t.status === status);
  }
  return list;
};

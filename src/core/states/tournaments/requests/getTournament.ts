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
}

function pickFiniteNumber(...vals: unknown[]): number | undefined {
  for (const v of vals) {
    if (typeof v === "number" && Number.isFinite(v)) {
      return v;
    }
  }
  return undefined;
}

function normalizeStructure(
  raw: TournamentsStructureResponse | null,
): TournamentsStructureResponse | undefined {
  if (!raw) {
    return undefined;
  }
  const s = raw as unknown as Record<string, unknown>;
  const entryPrice = pickFiniteNumber(s.entryPrice, s.entry_price);
  const reentryPrice = pickFiniteNumber(s.reentryPrice, s.reentry_price);
  return {
    ...raw,
    ...(entryPrice != null ? { entryPrice } : {}),
    ...(reentryPrice != null ? { reentryPrice } : {}),
  };
}

/** Ответ GET /v2/api/tournaments/{id} (TournamentWithStructureResponse). */
interface TournamentWithStructureResponse {
  readonly id: number;
  readonly name: string;
  readonly status: string;
  readonly date: number;
  readonly structure: TournamentsStructureResponse | null;
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
    withCredentials: false,
    body: undefined,
    mapping: {
      success: async (res) => {
        const j = (await res.toJson()) as TournamentWithStructureResponse;
        return {
          id: j.id,
          name: j.name,
          status: normalizeTournamentStatus(j.status),
          date: j.date,
          structure: normalizeStructure(j.structure),
        };
      },
      404: () => null,
      unknownError: () => null,
    },
  });
};

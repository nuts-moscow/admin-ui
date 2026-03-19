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
          structure: j.structure ?? undefined,
        };
      },
      404: () => null,
      unknownError: () => null,
    },
  });
};

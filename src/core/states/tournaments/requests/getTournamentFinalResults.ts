import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface BountyKillEntry {
  readonly playerId: string;
  readonly playerName?: string;
}

export interface TournamentPlayerResult {
  readonly playerId: number | string;
  /** ID игрока в турнире (для сортировки при отсутствии placement). */
  readonly tournamentPlayerId?: number | string;
  readonly playerName: string;
  readonly placement: number | null;
  readonly bountyCount: number;
  readonly bountyKills?: (BountyKillEntry | string)[];
  readonly eliminatedBy?: string[];
}

export interface TournamentFinalResultsResponse {
  readonly results?: TournamentPlayerResult[];
}

export const getTournamentFinalResults = async (
  environment: Environment,
  tournamentId: string
): Promise<TournamentFinalResultsResponse | null> => {
  return securedFetch<undefined, TournamentFinalResultsResponse | null>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v1/tournaments/final-results?tournamentId=${tournamentId}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => null,
      404: () => null,
      500: () => null,
      unknownError: () => null,
    },
  });
};

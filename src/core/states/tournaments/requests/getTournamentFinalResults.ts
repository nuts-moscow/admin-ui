import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface TournamentPlayerResult {
  readonly playerId: number;
  readonly playerName: string;
  readonly placement: number;
  readonly bountyCount: number;
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

import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface TournamentRebuyCountResponse {
  readonly rebuyCount: number;
}

export const getTournamentRebuyCount = async (
  environment: Environment,
  tournamentId: string
): Promise<TournamentRebuyCountResponse | null> => {
  return securedFetch<undefined, TournamentRebuyCountResponse | null>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/rebuy-count`,
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

import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { InGamePlayerState } from "../common/InGamePlayerState";

export const getTournamentPlayerState = async (
  environment: Environment,
  tournamentId: string,
): Promise<InGamePlayerState[]> => {
  return securedFetch<undefined, InGamePlayerState[]>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => [],
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  });
};

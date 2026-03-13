import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export const removePlayerFromTournament = (
  environment: Environment,
  tournamentId: string,
  playerId: string,
) => {
  return securedFetch<undefined, Record<string, unknown>>({
    method: "DELETE",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => null as any,
      400: () => new Error("Invalid tournamentId or playerId"),
      404: () => new Error("Tournament or player not found"),
      500: () => new Error("Server error"),
    },
  });
};

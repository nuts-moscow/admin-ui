import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export const addPlayerToTournament = (
  environment: Environment,
  tournamentId: string,
  playerId: number
) => {
  return securedFetch<undefined, Record<string, unknown>>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid tournamentId or playerId"),
      404: () => new Error("Tournament or player not found"),
      500: () => new Error("Server error"),
    },
  });
};

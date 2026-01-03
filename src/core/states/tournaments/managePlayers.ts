import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";

export const addPlayerToTournament = async (
  environment: Environment,
  tournamentId: string,
  playerId: number
): Promise<object> => {
  return securedFetch<undefined, object>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v1/tournaments/add-player-to-tournament?tournamentId=${tournamentId}&playerId=${playerId}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid tournament or player ID"),
      404: () => new Error("Tournament or player not found"),
      500: () => new Error("Server error"),
    },
  });
};

export const removePlayerFromTournament = async (
  environment: Environment,
  tournamentId: string,
  playerId: number
): Promise<object> => {
  return securedFetch<undefined, object>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v1/tournaments/remove-player-from-tournament?tournamentId=${tournamentId}&playerId=${playerId}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid tournament or player ID"),
      404: () => new Error("Tournament or player not found"),
      500: () => new Error("Server error"),
    },
  });
};

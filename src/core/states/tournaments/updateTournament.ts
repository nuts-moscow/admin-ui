import { Environment } from "@/core/states/environment/Environment";
import { UpdateTournamentRequest, Tournament } from "./types";
import { securedFetch } from "@/core/utils/misc/securedFetch";

export const updateTournament = async (
  environment: Environment,
  request: UpdateTournamentRequest
): Promise<Tournament[]> => {
  return securedFetch<UpdateTournamentRequest, Tournament[]>({
    method: "POST",
    host: environment.apiUrl,
    path: "/v1/tournaments/update",
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid tournament data"),
      404: () => new Error("Tournament not found"),
      500: () => new Error("Server error"),
    },
  });
};

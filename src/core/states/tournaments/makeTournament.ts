import { Environment } from "@/core/states/environment/Environment";
import { MakeTournamentRequest } from "./types";
import { securedFetch } from "@/core/utils/misc/securedFetch";

export const makeTournament = async (
  environment: Environment,
  request: MakeTournamentRequest
): Promise<any[]> => {
  return securedFetch<MakeTournamentRequest, any[]>({
    method: "POST",
    host: environment.apiUrl,
    path: "/v1/tournaments/make",
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

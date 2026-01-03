import { Environment } from "@/core/states/environment/Environment";
import { MakeTournamentStructureRequest, TournamentStructure } from "./types";
import { securedFetch } from "@/core/utils/misc/securedFetch";

export const makeTournamentStructure = async (
  environment: Environment,
  request: MakeTournamentStructureRequest
): Promise<TournamentStructure[]> => {
  return securedFetch<MakeTournamentStructureRequest, TournamentStructure[]>({
    method: "POST",
    host: environment.apiUrl,
    path: "/v1/tournaments-structure/make",
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid tournament structure data"),
      404: () => new Error("Resource not found"),
      500: () => new Error("Server error"),
    },
  });
};

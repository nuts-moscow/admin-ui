import { Environment } from "@/core/states/environment/Environment";

import { TournamentStructure } from "../common/TournamentStructure";
import { securedFetch } from "@/core/utils/misc/securedFetch";
import { MakeTournamentStructureRequest } from "../../tournaments/types";

export interface UpdateTournamentStructureRequest
  extends MakeTournamentStructureRequest {
  readonly id: number;
}

export const updateTournamentStructure = async (
  environment: Environment,
  request: UpdateTournamentStructureRequest
): Promise<TournamentStructure[]> => {
  return securedFetch<UpdateTournamentStructureRequest, TournamentStructure[]>({
    method: "POST",
    host: environment.apiUrl,
    path: "/v1/tournaments-structure/update",
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid tournament structure data"),
      404: () => new Error("Tournament structure not found"),
      500: () => new Error("Server error"),
    },
  });
};

import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Blinds } from "../common/BlindType";
import { TournamentStructure } from "../common/TournamentStructure";

export interface CreateTournamentStructureRequest {
  readonly name: string;
  readonly playersLimit: number;
  readonly stackSize: number;
  readonly freezeOutEnabled: boolean;
  readonly blinds?: Blinds;
}

export const createTournamentStructure = async (
  environment: Environment,
  request: CreateTournamentStructureRequest
): Promise<TournamentStructure[]> => {
  return securedFetch<CreateTournamentStructureRequest, TournamentStructure[]>({
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

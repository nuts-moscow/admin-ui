import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { UpdateTournamentRequest } from "../common/UpdateTournamentRequest";
import { ShortTournament } from "./getTournaments";

export const updateTournament = async (
  environment: Environment,
  request: UpdateTournamentRequest,
): Promise<ShortTournament[]> => {
  return securedFetch<UpdateTournamentRequest, ShortTournament[]>({
    method: "PUT",
    host: environment.apiUrl,
    path: "/v1/tournaments/update",
    withCredentials: false,
    body: {
      ...request,

      structure: {
        ...request.structure,
        // @ts-ignore
        blinds: request.structure.blindsStructure,
      },
    },
    mapping: {
      success: (res) => res.toJson(),
      400: () => [],
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  }) as any;
};

export const launchTournament = async (
  environment: Environment,
  request: UpdateTournamentRequest,
): Promise<ShortTournament[]> => {
  return updateTournament(environment, {
    ...request,
    status: "InProgress",
  });
};

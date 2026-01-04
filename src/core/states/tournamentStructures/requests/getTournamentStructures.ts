import { securedFetch } from "@/core/utils/misc/securedFetch";
import { TournamentStructure } from "../common/TournamentStructure";
import { Environment } from "../../environment/Environment";

export const getTournamentStructures = (environment: Environment) => {
  return securedFetch<undefined, TournamentStructure[]>({
    method: "GET",
    host: environment.apiUrl,
    path: "/v1/tournaments-structure/list",
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  });
};

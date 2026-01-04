import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { TournamentStructure } from "../common/TournamentStructure";

export const getTournamentStructure = (
  id: number,
  environment: Environment
) => {
  return securedFetch<undefined, TournamentStructure | null>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v1/tournaments-structure/get?id=${id}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => null,
      404: () => null,
      500: () => null,
      unknownError: () => null,
    },
  });
};

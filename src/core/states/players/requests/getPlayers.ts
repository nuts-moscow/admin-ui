import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Player } from "../common/Player";
import { Environment } from "../../environment/Environment";

export const getPlayers = (environment: Environment) => {
  return securedFetch<undefined, Player[]>({
    method: "GET",
    host: environment.apiUrl,
    path: "/v1/players/list",
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


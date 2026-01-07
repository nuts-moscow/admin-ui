import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Player } from "../common/Player";
import { Environment } from "../../environment/Environment";

export const getPlayer = (environment: Environment, playerId: number) => {
  return securedFetch<undefined, Player>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v1/players/get?id=${playerId}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid player id"),
      404: () => new Error("Player not found"),
      500: () => new Error("Server error"),
    },
  });
};


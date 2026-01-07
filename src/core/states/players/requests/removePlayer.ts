import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export const removePlayer = (environment: Environment, playerId: number) => {
  return securedFetch<undefined, Record<string, unknown>>({
    method: "DELETE",
    host: environment.apiUrl,
    path: `/v1/players/remove?id=${playerId}`,
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


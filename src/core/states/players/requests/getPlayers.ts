import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Player } from "../common/Player";
import { Environment } from "../../environment/Environment";

/** Тело ответа GET /v2/api/players */
export interface GetPlayersResponse {
  readonly players: Player[];
}

function toPlayerList(value: unknown): Player[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (
    value &&
    typeof value === "object" &&
    "players" in value &&
    Array.isArray((value as { players: unknown }).players)
  ) {
    return (value as GetPlayersResponse).players;
  }
  return [];
}

export const getPlayers = (environment: Environment) => {
  return securedFetch<undefined, Player[]>({
    method: "GET",
    host: environment.apiUrl,
    path: "/v2/api/players",
    withCredentials: false,
    body: undefined,
    mapping: {
      success: async (res) => toPlayerList(await res.toJson()),
      404: () => [],
      500: () => [],
      unknownError: () => [],
    },
  });
};


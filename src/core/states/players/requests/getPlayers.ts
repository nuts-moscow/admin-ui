import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Player } from "../common/Player";
import { Environment } from "../../environment/Environment";

/** Тело ответа GET /v2/api/players */
export interface GetPlayersResponse {
  readonly players: Player[];
}

function normalizeSignAgreement(
  raw: Player & { readonly sign_agreement?: boolean },
): Player {
  return {
    ...raw,
    signAgreement:
      raw.signAgreement === true || raw.sign_agreement === true,
  };
}

function toPlayerList(value: unknown): Player[] {
  let list: Player[] = [];
  if (Array.isArray(value)) {
    list = value as Player[];
  } else if (
    value &&
    typeof value === "object" &&
    "players" in value &&
    Array.isArray((value as { players: unknown }).players)
  ) {
    list = (value as GetPlayersResponse).players;
  }
  return list.map((p) =>
    normalizeSignAgreement(p as Player & { readonly sign_agreement?: boolean }),
  );
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


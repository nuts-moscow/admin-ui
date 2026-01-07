import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Player } from "../common/Player";

export interface CreatePlayerRequest {
  readonly nickname: string;
  readonly name?: string;
  readonly tg?: string;
  readonly phone?: string;
  readonly notes?: string;
}

export const createPlayer = async (
  environment: Environment,
  request: CreatePlayerRequest
): Promise<Player> => {
  return securedFetch<CreatePlayerRequest, Player>({
    method: "POST",
    host: environment.apiUrl,
    path: "/v1/players/create",
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid player data"),
      404: () => new Error("Resource not found"),
      500: () => new Error("Server error"),
    },
  });
};

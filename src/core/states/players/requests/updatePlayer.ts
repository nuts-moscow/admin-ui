import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Player } from "../common/Player";

export interface UpdatePlayerRequest {
  readonly id: number;
  readonly nickname: string;
  readonly name?: string;
  readonly tg?: string;
  readonly phone?: string;
  readonly notes?: string;
}

export const updatePlayer = async (
  environment: Environment,
  request: UpdatePlayerRequest
): Promise<Player> => {
  return securedFetch<UpdatePlayerRequest, Player>({
    method: "PUT",
    host: environment.apiUrl,
    path: "/v1/players/update",
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid player data"),
      404: () => new Error("Player not found"),
      500: () => new Error("Server error"),
    },
  });
};

import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Player } from "../common/Player";

export interface CreatePlayerRequest {
  readonly nickname: string;
  readonly name?: string | null;
  readonly tg?: string | null;
  readonly phone?: string | null;
  readonly notes?: string | null;
  readonly signAgreement?: boolean;
}

/** Тело запроса POST v2/api/players/create (snake_case). */
interface CreatePlayerBody {
  readonly nickname: string;
  readonly name?: string | null;
  readonly phone?: string | null;
  readonly tg?: string | null;
  readonly notes?: string | null;
  readonly sign_agreement?: boolean;
}

function toCreatePlayerBody(request: CreatePlayerRequest): CreatePlayerBody {
  return {
    nickname: request.nickname,
    name: request.name ?? null,
    phone: request.phone ?? null,
    tg: request.tg ?? null,
    notes: request.notes ?? null,
    sign_agreement: request.signAgreement === true,
  };
}

export const createPlayer = async (
  environment: Environment,
  request: CreatePlayerRequest
): Promise<Player> => {
  return securedFetch<CreatePlayerBody, Player, Player>({
    method: "POST",
    host: environment.apiUrl,
    path: "/v2/api/players/create",
    withCredentials: false,
    body: toCreatePlayerBody(request),
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid request body"),
      409: () => new Error("Player with this nickname already exists"),
      500: () => new Error("Failed to create player"),
    },
  });
};

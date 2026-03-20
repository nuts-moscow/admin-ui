import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Player } from "../common/Player";

export interface UpdatePlayerRequest {
  readonly id: number;
  readonly nickname?: string;
  readonly name?: string | null;
  readonly tg?: string | null;
  readonly phone?: string | null;
  readonly notes?: string | null;
  readonly signAgreement?: boolean;
}

/** Тело запроса PATCH v2/api/players/{playerId} (snake_case). Как в curl. */
interface UpdatePlayerBody {
  nickname?: string;
  name?: string | null;
  phone?: string | null;
  tg?: string | null;
  notes?: string | null;
  sign_agreement?: boolean;
}

function toUpdatePlayerBody(
  request: Omit<UpdatePlayerRequest, "id">
): UpdatePlayerBody {
  const body: UpdatePlayerBody = {};
  if (request.nickname !== undefined) body.nickname = request.nickname;
  if (request.name !== undefined) body.name = request.name ?? null;
  if (request.phone !== undefined) body.phone = request.phone ?? null;
  if (request.tg !== undefined) body.tg = request.tg ?? null;
  if (request.notes !== undefined) body.notes = request.notes ?? null;
  if (request.signAgreement !== undefined)
    body.sign_agreement = request.signAgreement === true;
  return body;
}

export const updatePlayer = async (
  environment: Environment,
  request: UpdatePlayerRequest
): Promise<Player> => {
  const { id, ...rest } = request;
  const body = toUpdatePlayerBody(rest);
  return securedFetch<UpdatePlayerBody, Player, Player>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/players/${id}`,
    withCredentials: false,
    body,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid request body or empty nickname"),
      404: () => new Error("Player not found"),
      409: () => new Error("Player with this nickname already exists"),
      500: () => new Error("Server error"),
    },
  });
};

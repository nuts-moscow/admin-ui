import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "@/core/states/environment/Environment";

/** Body PATCH v2/api/players/{playerId}/free-entries (FreeCountDeltaBody). */
interface FreeCountDeltaBody {
  readonly delta: number;
}

/**
 * PATCH /v2/api/players/{playerId}/free-entries — изменить кол-во бесплатных входов.
 * Body: { delta: number } (+n или -n). Результат ограничен снизу 0.
 */
export const updatePlayerFreeEntries = async (
  environment: Environment,
  playerId: number | string,
  delta: number
): Promise<unknown> => {
  return securedFetch<FreeCountDeltaBody, unknown>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/players/${encodeURIComponent(String(playerId))}/free-entries`,
    withCredentials: false,
    body: { delta },
    mapping: {
      success: async (res) => res.toJson(),
      400: () => new Error("Invalid body (delta required and must be a number)"),
      404: () => new Error("Player not found"),
      500: () => new Error("Server error"),
    },
  });
};

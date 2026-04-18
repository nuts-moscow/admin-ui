import { Environment } from "@/core/states/environment/Environment";
import {
  securedFetch,
  SecuredErrorResponse,
} from "@/core/utils/misc/securedFetch";

async function messageFromErrorResponse(
  res: SecuredErrorResponse,
  fallback: string,
): Promise<Error> {
  try {
    const data = (await res.toJson()) as { error?: unknown };
    const msg = data?.error;
    if (typeof msg === "string" && msg.trim() !== "") {
      return new Error(msg);
    }
  } catch {
    // empty or non-JSON body
  }
  return new Error(fallback);
}

/**
 * DELETE /v2/api/players/{playerId} — удалить игрока из справочника (успех 204, тело пустое).
 */
export const deletePlayer = async (
  environment: Environment,
  playerId: number | string,
): Promise<void> => {
  const id = encodeURIComponent(String(playerId).trim());
  if (!id || id === "undefined" || id === "null") {
    throw new Error("Некорректный id игрока");
  }

  return securedFetch<undefined, void, void>({
    method: "DELETE",
    host: environment.apiUrl,
    path: `/v2/api/players/${id}`,
    withCredentials: true,
    body: undefined,
    mapping: {
      success: async (res) => {
        if (res.status === 204) {
          return;
        }
        await res.toJson().catch(() => undefined);
      },
      404: async (err) => {
        throw await messageFromErrorResponse(err, "Player not found");
      },
      500: async (err) => {
        throw await messageFromErrorResponse(err, "Failed to delete player");
      },
      unknownError: async (err) => {
        throw await messageFromErrorResponse(err, "Failed to delete player");
      },
    },
  });
};

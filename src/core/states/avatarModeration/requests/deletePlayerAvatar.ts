import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";

/**
 * Снятие уже опубликованного аватара — второй взгляд, а не фильтр: картинка
 * попала на экраны потому, что её кто-то разрешил, и это способ передумать.
 * Причина не запрашивается; действие пишется в аудит на стороне бэкенда.
 */
export const deletePlayerAvatar = async (
  environment: Environment,
  playerId: number
): Promise<boolean> => {
  return securedFetch<undefined, { removed: boolean }, boolean>({
    method: "DELETE",
    host: environment.apiUrl,
    path: `/v2/api/players/${playerId}/avatar`,
    withCredentials: true,
    body: undefined,
    mapping: {
      success: async (res) => (await res.toJson()).removed,
      400: () => new Error("Некорректный запрос"),
      500: () => new Error("Не удалось снять аватар"),
    },
  });
};

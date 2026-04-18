import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import type { InGamePlayerState } from "../common/InGamePlayerState";
import { normalizeTournamentPlayerItem } from "./getTournamentPlayerState";

interface PatchRatingNonPlacementBody {
  readonly delta: number;
}

/**
 * PATCH /v2/api/tournaments/{tournamentId}/players/{playerId}/rating-non-placement
 * Накопитель баллов «вне места» в Redis.
 */
export const patchTournamentPlayerRatingNonPlacement = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  delta: number,
): Promise<InGamePlayerState | null> => {
  return securedFetch<PatchRatingNonPlacementBody, unknown, InGamePlayerState | null>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${encodeURIComponent(playerId)}/rating-non-placement`,
    withCredentials: true,
    body: { delta },
    mapping: {
      success: async (res) => {
        if (res.status === 204 || res.status === 205) {
          return null;
        }
        try {
          const json = await res.toJson();
          if (json == null) {
            return null;
          }
          const normalized = normalizeTournamentPlayerItem(json);
          return normalized;
        } catch {
          return null;
        }
      },
      400: () => {
        throw new Error("Некорректное тело запроса (delta)");
      },
      401: () => {
        throw new Error("Нет авторизации");
      },
      404: () => {
        throw new Error("Игрок не найден в турнире");
      },
      409: () => {
        throw new Error("Операция недоступна в текущем статусе турнира");
      },
      500: () => {
        throw new Error("Ошибка сервера");
      },
      unknownError: () => {
        throw new Error("Не удалось применить изменение баллов");
      },
    },
  });
};

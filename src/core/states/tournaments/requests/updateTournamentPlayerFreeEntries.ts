import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "@/core/states/environment/Environment";
import { InGamePlayerState } from "../common/InGamePlayerState";

interface FreeCountDeltaBody {
  readonly delta: number;
}

/**
 * PATCH /v2/api/tournaments/{tournamentId}/players/{playerId}/free-entries —
 * турнирный счётчик бесплатных входов (не глобальный профиль).
 */
export const updateTournamentPlayerFreeEntries = async (
  environment: Environment,
  tournamentId: number | string,
  playerId: string,
  delta: number,
): Promise<InGamePlayerState> => {
  return securedFetch<FreeCountDeltaBody, InGamePlayerState>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${encodeURIComponent(String(tournamentId))}/players/${encodeURIComponent(playerId)}/free-entries`,
    withCredentials: true,
    body: { delta },
    mapping: {
      success: async (res) => (await res.toJson()) as InGamePlayerState,
      400: () =>
        new Error("Некорректное тело (нужен delta — число)"),
      404: () =>
        new Error("Нет состояния игрока в этом турнире"),
      500: () => new Error("Ошибка сервера"),
    },
  });
};

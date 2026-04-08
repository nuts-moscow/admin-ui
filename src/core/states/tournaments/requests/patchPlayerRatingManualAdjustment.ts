import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

interface PatchManualAdjustmentBody {
  readonly manualAdjustment: number;
}

/**
 * PATCH /v2/api/tournaments/:id/players/:playerId/rating-manual-adjustment
 * Только для completed-турниров (иначе 409).
 */
export const patchPlayerRatingManualAdjustment = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  manualAdjustment: number,
): Promise<void> => {
  await securedFetch<PatchManualAdjustmentBody, void>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${encodeURIComponent(playerId)}/rating-manual-adjustment`,
    withCredentials: false,
    body: { manualAdjustment },
    mapping: {
      success: () => undefined,
      400: () => {
        throw new Error("Некорректное значение корректировки");
      },
      404: () => {
        throw new Error("Игрок или турнир не найдены");
      },
      409: () => {
        throw new Error("Ручная правка доступна только для завершённых турниров");
      },
      500: () => {
        throw new Error("Ошибка сервера при сохранении корректировки");
      },
      unknownError: () => {
        throw new Error("Не удалось сохранить корректировку");
      },
    },
  });
};

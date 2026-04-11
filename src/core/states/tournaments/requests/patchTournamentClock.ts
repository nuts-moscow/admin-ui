import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

/** PATCH /v2/api/tournaments/{id}/clock — пауза / продление уровня (тела уточнить по OpenAPI). */
export interface PatchTournamentClockBody {
  readonly paused?: boolean;
  readonly extendCurrentLevelSec?: number;
}

export const patchTournamentClock = async (
  environment: Environment,
  tournamentId: number,
  body: PatchTournamentClockBody
): Promise<void> => {
  await securedFetch<PatchTournamentClockBody, void>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/clock`,
    withCredentials: true,
    body,
    mapping: {
      success: () => undefined,
      400: () => {
        throw new Error("Некорректный запрос часов");
      },
      404: () => {
        throw new Error("Турнир не найден");
      },
      409: () => {
        throw new Error("Операция недоступна в текущем состоянии");
      },
      500: () => {
        throw new Error("Ошибка сервера");
      },
      unknownError: () => {
        throw new Error("Не удалось обновить часы турнира");
      },
    },
  });
};

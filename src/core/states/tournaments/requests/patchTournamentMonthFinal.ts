import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface PatchMonthFinalBody {
  readonly monthFinal: boolean;
}

/**
 * PATCH /v2/api/tournaments/{id}/month-final
 * Единственный способ сменить флаг финала месяца.
 */
export const patchTournamentMonthFinal = async (
  environment: Environment,
  tournamentId: number,
  monthFinal: boolean,
): Promise<void> => {
  const body: PatchMonthFinalBody = { monthFinal };
  await securedFetch<PatchMonthFinalBody, void>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/month-final`,
    withCredentials: true,
    body,
    mapping: {
      success: () => undefined,
      400: () => {
        throw new Error("Некорректное тело запроса (monthFinal)");
      },
      404: () => {
        throw new Error("Турнир не найден");
      },
      500: () => {
        throw new Error("Ошибка сервера");
      },
      unknownError: () => {
        throw new Error("Не удалось обновить финал месяца");
      },
    },
  });
};

import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface PatchLateRegistrationBody {
  readonly lateRegistrationClosed: boolean;
}

/**
 * PATCH /v2/api/tournaments/{id}/late-registration
 * Единственный способ сменить флаг поздней регистрации.
 */
export const patchTournamentLateRegistration = async (
  environment: Environment,
  tournamentId: number,
  lateRegistrationClosed: boolean,
): Promise<void> => {
  const body: PatchLateRegistrationBody = { lateRegistrationClosed };
  await securedFetch<PatchLateRegistrationBody, void>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/late-registration`,
    withCredentials: true,
    body,
    mapping: {
      success: () => undefined,
      400: () => {
        throw new Error("Некорректное тело запроса (lateRegistrationClosed)");
      },
      404: () => {
        throw new Error("Турнир не найден");
      },
      500: () => {
        throw new Error("Ошибка сервера");
      },
      unknownError: () => {
        throw new Error("Не удалось обновить лейт-регу");
      },
    },
  });
};

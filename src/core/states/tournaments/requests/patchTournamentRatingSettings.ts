import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { TournamentInfoResponse } from "./getTournament";
import { TournamentStatus } from "../common/TournamentStatus";

interface PatchTournamentRatingSettingsBody {
  readonly name: string;
  readonly date: number;
  readonly status: string;
  readonly ratingGuaranteeEnabled?: boolean;
  readonly ratingPointsCoefficient?: number;
  readonly ratingBountyCoefficient?: number;
}

function statusToApi(status: TournamentStatus): string {
  if (status === "InProgress") return "in_progress";
  if (status === "Completed") return "completed";
  return "registration_open";
}

export interface RatingSettingsPatch {
  readonly ratingGuaranteeEnabled?: boolean;
  readonly ratingPointsCoefficient?: number;
  readonly ratingBountyCoefficient?: number;
}

export const patchTournamentRatingSettings = async (
  environment: Environment,
  tournament: Pick<TournamentInfoResponse, "id" | "name" | "date" | "status">,
  patch: RatingSettingsPatch,
): Promise<void> => {
  const body: PatchTournamentRatingSettingsBody = {
    name: tournament.name,
    date: tournament.date,
    status: statusToApi(tournament.status),
    ...patch,
  };

  await securedFetch<PatchTournamentRatingSettingsBody, void>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournament.id}`,
    withCredentials: false,
    body,
    mapping: {
      success: () => undefined,
      400: () => {
        throw new Error("Некорректные данные настроек рейтинга");
      },
      404: () => {
        throw new Error("Турнир не найден");
      },
      409: () => {
        throw new Error("Конфликт: невозможно обновить настройки рейтинга");
      },
      500: () => {
        throw new Error("Ошибка сервера при сохранении настроек рейтинга");
      },
      unknownError: () => {
        throw new Error("Не удалось сохранить настройки рейтинга");
      },
    },
  });
};

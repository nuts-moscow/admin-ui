import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export const DEFAULT_TOURNAMENT_VENUE_ID = "mansarda";

export interface TournamentVenue {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly mapsUrl: string;
}

export async function getTournamentVenues(environment: Environment): Promise<TournamentVenue[]> {
  return securedFetch<undefined, { venues: TournamentVenue[] }, TournamentVenue[]>({
    method: "GET",
    host: environment.apiUrl,
    path: "/v2/api/tournament-venues",
    withCredentials: true,
    body: undefined,
    mapping: { success: async (res) => (await res.toJson()).venues },
  });
}

export async function patchTournamentVenue(environment: Environment, id: number, venueId: string): Promise<void> {
  return securedFetch<{ venueId: string }, { venueId: string }, void>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${id}/venue`,
    withCredentials: true,
    body: { venueId },
    mapping: {
      success: async (res) => {
        if ((await res.toJson()).venueId !== venueId) {
          throw new Error("Сервер не подтвердил выбранное место проведения");
        }
      },
      400: () => new Error("Неизвестное место проведения"),
      404: () => new Error("Турнир или выбор места проведения недоступен"),
      unknownError: () => new Error("Не удалось сохранить место проведения"),
    },
  });
}

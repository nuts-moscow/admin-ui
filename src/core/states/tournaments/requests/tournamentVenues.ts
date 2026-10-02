import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export const DEFAULT_TOURNAMENT_VENUE_ID = "mansarda";

export interface CustomTournamentVenue {
  readonly name: string;
  readonly address: string;
  readonly mapsUrl: string;
}

export const EMPTY_CUSTOM_VENUE: CustomTournamentVenue = { name: "", address: "", mapsUrl: "" };

export function normalizeCustomVenue(value: CustomTournamentVenue): CustomTournamentVenue {
  return { name: value.name.trim(), address: value.address.trim(), mapsUrl: value.mapsUrl.trim() };
}

export function customVenueError(value: CustomTournamentVenue): string | null {
  const venue = normalizeCustomVenue(value);
  if (!venue.name || !venue.address || !venue.mapsUrl) return "Заполните имя заведения, адрес и ссылку на карту";
  if (venue.name.length > 150 || venue.address.length > 300 || venue.mapsUrl.length > 2048) return "Сократите имя до 150, адрес до 300 и ссылку до 2048 символов";
  try {
    const url = new URL(venue.mapsUrl);
    if (["http:", "https:"].includes(url.protocol) && url.hostname) return null;
  } catch { /* Invalid links stay in the draft. */ }
  return "Укажите полную ссылку на карту, начиная с https:// или http://";
}

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

export async function patchTournamentVenue(environment: Environment, id: number, venueId: string, customVenue?: CustomTournamentVenue): Promise<void> {
  return securedFetch<{ venueId: string; customVenue?: CustomTournamentVenue }, { venueId: string; customVenue?: CustomTournamentVenue }, void>({
    method: "PATCH",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${id}/venue`,
    withCredentials: true,
    body: { venueId, ...(venueId === "custom" && customVenue ? { customVenue: normalizeCustomVenue(customVenue) } : {}) },
    mapping: {
      success: async (res) => {
        const saved = await res.toJson();
        const expected = customVenue && normalizeCustomVenue(customVenue);
        if (saved.venueId !== venueId || (venueId === "custom" && (!expected ||
          saved.customVenue?.name !== expected.name || saved.customVenue?.address !== expected.address ||
          saved.customVenue?.mapsUrl !== expected.mapsUrl))) {
          throw new Error("Сервер не подтвердил выбранное место проведения");
        }
      },
      400: () => new Error("Проверьте место проведения: нужны имя, адрес и ссылка http(s)"),
      404: () => new Error("Турнир или выбор места проведения недоступен"),
      unknownError: () => new Error("Не удалось сохранить место проведения"),
    },
  });
}

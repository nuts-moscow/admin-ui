import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { Bonus, InGamePlayerState } from "../common/InGamePlayerState";

/** BonusMutationBody для POST bonuses / bonuses/remove. */
interface BonusMutationBody {
  readonly bonus: Bonus;
}

/**
 * POST /v2/api/tournaments/{tournamentId}/players/{playerId}/bonuses
 * — добавить один экземпляр бонуса.
 */
export const addPlayerTournamentBonus = async (
  environment: Environment,
  tournamentId: number | string,
  playerId: string,
  bonus: Bonus,
): Promise<InGamePlayerState> => {
  const body: BonusMutationBody = { bonus };
  return securedFetch<BonusMutationBody, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${encodeURIComponent(String(tournamentId))}/players/${encodeURIComponent(playerId)}/bonuses`,
    withCredentials: false,
    body,
    mapping: {
      success: async (res) => (await res.toJson()) as InGamePlayerState,
      400: () => new Error("Invalid bonus or body"),
      404: () => new Error("Player not in tournament"),
      500: () => new Error("Server error"),
    },
  });
};

/**
 * POST /v2/api/tournaments/{tournamentId}/players/{playerId}/bonuses/remove
 * — убрать один экземпляр бонуса.
 */
export const removePlayerTournamentBonus = async (
  environment: Environment,
  tournamentId: number | string,
  playerId: string,
  bonus: Bonus,
): Promise<InGamePlayerState> => {
  const body: BonusMutationBody = { bonus };
  return securedFetch<BonusMutationBody, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${encodeURIComponent(String(tournamentId))}/players/${encodeURIComponent(playerId)}/bonuses/remove`,
    withCredentials: false,
    body,
    mapping: {
      success: async (res) => (await res.toJson()) as InGamePlayerState,
      400: () => new Error("Invalid bonus or body"),
      404: () => new Error("No state or bonus count already zero"),
      500: () => new Error("Server error"),
    },
  });
};

export interface CustomBonusChipsBody {
  readonly chips: number;
}

/**
 * POST .../bonuses/custom — добавить грант кастомных фишек.
 */
export const addPlayerCustomBonusChips = async (
  environment: Environment,
  tournamentId: number | string,
  playerId: string,
  chips: number,
): Promise<InGamePlayerState> => {
  const body: CustomBonusChipsBody = { chips };
  return securedFetch<CustomBonusChipsBody, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${encodeURIComponent(String(tournamentId))}/players/${encodeURIComponent(playerId)}/bonuses/custom`,
    withCredentials: false,
    body,
    mapping: {
      success: async (res) => (await res.toJson()) as InGamePlayerState,
      400: () => new Error("Некорректная сумма фишек или тело запроса"),
      404: () => new Error("Игрок не в турнире"),
      500: () => new Error("Server error"),
    },
  });
};

/**
 * POST .../bonuses/custom/remove — снять один грант с конца, равный chips.
 */
export const removePlayerCustomBonusChipsOne = async (
  environment: Environment,
  tournamentId: number | string,
  playerId: string,
  chips: number,
): Promise<InGamePlayerState> => {
  const body: CustomBonusChipsBody = { chips };
  return securedFetch<CustomBonusChipsBody, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${encodeURIComponent(String(tournamentId))}/players/${encodeURIComponent(playerId)}/bonuses/custom/remove`,
    withCredentials: false,
    body,
    mapping: {
      success: async (res) => (await res.toJson()) as InGamePlayerState,
      400: () => new Error("Некорректная сумма фишек или тело запроса"),
      404: () =>
        new Error("Нет состояния или гранта с такой суммой (с конца списка)"),
      500: () => new Error("Server error"),
    },
  });
};

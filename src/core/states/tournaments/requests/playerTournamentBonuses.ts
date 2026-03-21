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

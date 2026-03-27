import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export type BountyEliminationType = "Rebuy" | "Out";

export interface BountyEliminateBody {
  readonly eliminatedPlayerId: string;
  readonly type: BountyEliminationType;
  /** Обязателен, если burnedStack не true. */
  readonly killerPlayerId?: string;
  readonly burnedStack?: boolean;
  /** Обязателен при burnedStack === true (целое ≥ 0). */
  readonly burnedChips?: number;
}

/**
 * POST /v2/api/tournaments/{tournamentId}/bounty/eliminate — успех 204 без тела.
 */
export const bountyEliminate = async (
  environment: Environment,
  tournamentId: number | string,
  body: BountyEliminateBody,
): Promise<void> => {
  const tid = encodeURIComponent(String(tournamentId));
  return securedFetch<BountyEliminateBody, void, void>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tid}/bounty/eliminate`,
    withCredentials: false,
    body,
    mapping: {
      success: async (res) => {
        if (res.status === 204) {
          return;
        }
        await res.toJson().catch(() => undefined);
      },
      400: () => new Error("Некорректные данные выбивания"),
      404: () => new Error("Игрок не найден в турнире"),
      500: () => new Error("Server error"),
    },
  });
};

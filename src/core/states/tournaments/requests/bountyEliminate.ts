import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export type BountyEliminationType = "Rebuy" | "Out";

export interface BountyEliminateBody {
  readonly eliminatedPlayerId: string;
  readonly type: BountyEliminationType;
  /** При обычном выбивании — минимум один id; при burnedStack — может быть [] (уточнять в OpenAPI бэкенда). */
  readonly killerPlayerIds: string[];
  readonly burnedStack?: boolean;
  /** Обязателен при burnedStack === true (целое ≥ 0). */
  readonly burnedChips?: number;
}

export interface BountyEliminateResponse {
  readonly eventId: string;
}

export interface BountyEliminateUndoBody {
  readonly eventId: string;
}

/** Как у остальных bounty-маршрутов (см. undoRebuyBurnedStack). */
const tournamentBountyPath = (tid: string, suffix: string) =>
  `/v2/api/tournaments/${tid}/bounty/${suffix}`;

/**
 * POST …/bounty/eliminate — успех 200, тело { eventId }.
 */
export const bountyEliminate = async (
  environment: Environment,
  tournamentId: number | string,
  body: BountyEliminateBody,
): Promise<BountyEliminateResponse> => {
  const tid = encodeURIComponent(String(tournamentId));
  return securedFetch<BountyEliminateBody, BountyEliminateResponse>({
    method: "POST",
    host: environment.apiUrl,
    path: tournamentBountyPath(tid, "eliminate"),
    withCredentials: true,
    body,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Некорректные данные выбивания"),
      404: () => new Error("Игрок не найден в турнире"),
      500: () => new Error("Server error"),
    },
  });
};

/**
 * POST /api/tournaments/{tournamentId}/bounty/eliminate/undo — полный откат события eliminate.
 */
export const bountyEliminateUndo = async (
  environment: Environment,
  tournamentId: number | string,
  body: BountyEliminateUndoBody,
): Promise<void> => {
  const tid = encodeURIComponent(String(tournamentId));
  return securedFetch<BountyEliminateUndoBody, void, void>({
    method: "POST",
    host: environment.apiUrl,
    path: tournamentBountyPath(tid, "eliminate/undo"),
    withCredentials: true,
    body,
    mapping: {
      success: async (res) => {
        if (res.status === 204) {
          return undefined;
        }
        await res.toJson().catch(() => undefined);
        return undefined;
      },
      400: () => new Error("Некорректные данные отката"),
      404: () => new Error("Событие или игрок не найдены"),
      500: () => new Error("Server error"),
    },
  });
};

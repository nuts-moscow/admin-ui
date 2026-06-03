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

/**
 * Результат записи выбивания:
 * - `ok` — событие записано, есть `eventId`;
 * - `already_out` — бэкенд вернул 409 `{ error: "already_out" }`: игрок уже выбыл,
 *   повторное выбивание НЕ записано. С точки зрения UX это идемпотентный успех
 *   (типичный результат двойного клика), а не ошибка.
 */
export type BountyEliminateResult =
  | { readonly outcome: "ok"; readonly eventId: string }
  | { readonly outcome: "already_out" };

export interface BountyEliminateUndoBody {
  readonly eventId: string;
}

/** Как у остальных bounty-маршрутов (см. undoRebuyBurnedStack). */
const tournamentBountyPath = (tid: string, suffix: string) =>
  `/v2/api/tournaments/${tid}/bounty/${suffix}`;

/**
 * POST …/bounty/eliminate.
 * Успех 200 → `{ outcome: "ok", eventId }`.
 * 409 `{ error: "already_out" }` → `{ outcome: "already_out" }` (идемпотентный
 * успех: игрок уже выбыл, повтор не записан). Остальные 409 — обычная ошибка.
 */
export const bountyEliminate = async (
  environment: Environment,
  tournamentId: number | string,
  body: BountyEliminateBody,
): Promise<BountyEliminateResult> => {
  const tid = encodeURIComponent(String(tournamentId));
  return securedFetch<
    BountyEliminateBody,
    BountyEliminateResponse,
    BountyEliminateResult
  >({
    method: "POST",
    host: environment.apiUrl,
    path: tournamentBountyPath(tid, "eliminate"),
    withCredentials: true,
    body,
    mapping: {
      success: async (res) => ({
        outcome: "ok" as const,
        eventId: (await res.toJson()).eventId,
      }),
      400: () => new Error("Некорректные данные выбивания"),
      404: () => new Error("Игрок не найден в турнире"),
      409: async (res) => {
        const parsed = (await res.toJson().catch(() => null)) as {
          error?: string;
        } | null;
        if (parsed?.error === "already_out") {
          return { outcome: "already_out" as const };
        }
        // Прочие конфликты 409 — обычная ошибка (тело сохраняем для formatApiErrorForUser).
        throw new Error(
          parsed ? JSON.stringify(parsed) : "Конфликт записи выбивания",
        );
      },
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

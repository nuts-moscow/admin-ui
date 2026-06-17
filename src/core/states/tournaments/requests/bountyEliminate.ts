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
 * - `ok` — событие записано, есть `eventId` (включая реплей того же действия по Idempotency-Key — бэк отдаёт то же тело);
 * - `already_out` — 409 `{ error: "already_out" }`: игрок уже выбыл, повтор НЕ записан (идемпотентный успех, не ошибка);
 * - `in_progress` — 409 `{ error: "in_progress" }`: то же действие ещё выполняется (двойной сабмит), не ошибка;
 * - `late_registration_closed` — 409 `{ error: "late_registration_closed" }`: поздняя регистрация закрыта, ребай недоступен.
 */
export type BountyEliminateResult =
  | { readonly outcome: "ok"; readonly eventId: string }
  | { readonly outcome: "already_out" }
  | { readonly outcome: "in_progress" }
  | { readonly outcome: "late_registration_closed" };

export interface BountyEliminateUndoBody {
  readonly eventId: string;
}

/** Как у остальных bounty-маршрутов (см. undoRebuyBurnedStack). */
const tournamentBountyPath = (tid: string, suffix: string) =>
  `/v2/api/tournaments/${tid}/bounty/${suffix}`;

/**
 * POST …/bounty/eliminate.
 * Идемпотентность: на каждое действие шлём заголовок `Idempotency-Key`. По умолчанию
 * генерируется новый ключ на вызов; передавай явный `idempotencyKey` только чтобы
 * переиспользовать ключ при ретрае ТОГО ЖЕ действия.
 * Коды: 200 → `ok`; 409 `already_out` / `in_progress` / `late_registration_closed`
 * (см. `BountyEliminateResult`); прочие 409 — обычная ошибка.
 */
export const bountyEliminate = async (
  environment: Environment,
  tournamentId: number | string,
  body: BountyEliminateBody,
  idempotencyKey: string = crypto.randomUUID(),
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
    headers: { "Idempotency-Key": idempotencyKey },
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
        switch (parsed?.error) {
          case "already_out":
            return { outcome: "already_out" as const };
          case "in_progress":
            return { outcome: "in_progress" as const };
          case "late_registration_closed":
            return { outcome: "late_registration_closed" as const };
          default:
            // Прочие конфликты 409 — обычная ошибка (тело сохраняем для formatApiErrorForUser).
            throw new Error(
              parsed ? JSON.stringify(parsed) : "Конфликт записи выбивания",
            );
        }
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

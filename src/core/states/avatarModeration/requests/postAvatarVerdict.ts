import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";

export type Verdict = "allow" | "refuse";

interface VerdictBody {
  readonly playerId: number;
  readonly submissionId: string;
  readonly verdict: Verdict;
}

export type VerdictResult =
  | { readonly ok: true; readonly address: string | null }
  /**
   * Игрок подменил картинку, пока админ смотрел, — или другой админ решил
   * первым. Не опубликовано и не стёрто ничего; строку надо перечитать.
   */
  | { readonly ok: false; readonly reason: "stale" };

export const postAvatarVerdict = async (
  environment: Environment,
  playerId: number,
  submissionId: string,
  verdict: Verdict
): Promise<VerdictResult> => {
  return securedFetch<VerdictBody, { address: string | null }, VerdictResult>({
    method: "POST",
    host: environment.apiUrl,
    path: "/v2/api/avatar-moderation/verdict",
    withCredentials: true,
    body: { playerId, submissionId, verdict },
    mapping: {
      success: async (res) => ({ ok: true, address: (await res.toJson()).address }),
      // Не ошибка, а исход: вердикт адресован картинке, которой больше нет.
      409: () => ({ ok: false, reason: "stale" }) as VerdictResult,
      400: () => new Error("Некорректный запрос"),
      500: () => new Error("Не удалось применить решение"),
    },
  });
};

import { Environment } from "@/core/states/environment/Environment";
import { securedFetch } from "@/core/utils/misc/securedFetch";

/** Одна ждущая заявка: чья, когда пришла, и сколько раз этому игроку уже отказывали. */
export interface PendingAvatar {
  readonly playerId: number;
  /**
   * Идентичность заявки. Её же клик отправляет обратно — если игрок успел
   * подменить картинку, вердикт не применится, и строка перерисуется.
   */
  readonly submissionId: string;
  readonly submittedAt: string;
  readonly refusalCount: number;
}

interface QueueResponse {
  readonly queue: readonly PendingAvatar[];
}

export const getAvatarQueue = async (
  environment: Environment
): Promise<readonly PendingAvatar[]> => {
  return securedFetch<undefined, QueueResponse, readonly PendingAvatar[]>({
    method: "GET",
    host: environment.apiUrl,
    path: "/v2/api/avatar-moderation/queue",
    withCredentials: true,
    body: undefined,
    mapping: {
      success: async (res) => (await res.toJson()).queue,
      500: () => new Error("Не удалось загрузить очередь"),
    },
  });
};

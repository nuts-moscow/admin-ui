"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { Box } from "@/components/Box/Box";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import {
  getAvatarQueue,
  PendingAvatar,
} from "@/core/states/avatarModeration/requests/getAvatarQueue";
import {
  postAvatarVerdict,
  Verdict,
} from "@/core/states/avatarModeration/requests/postAvatarVerdict";
import { PendingAvatarRow } from "./PendingAvatarRow";

/**
 * Очередь фотографий, ждущих решения. Старые сверху — так их и отдаёт бэкенд.
 *
 * От админа не требуется ничего, кроме решения: ни причины, ни подтверждения.
 * Единственная тонкость — вердикт адресован конкретной картинке. Если игрок
 * успел подменить её, бэкенд отвечает «устарело», и строка перечитывается
 * вместо того, чтобы молча применить решение к другим байтам.
 */
export const AvatarModerationView: FC = () => {
  const environment = useEnvironment();
  const [queue, setQueue] = useState<readonly PendingAvatar[]>([]);
  const [busyPlayerId, setBusyPlayerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setQueue(await getAvatarQueue(environment));
      setError(null);
    } catch {
      setError("Не удалось загрузить очередь");
    }
  }, [environment]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const decide = useCallback(
    async (entry: PendingAvatar, verdict: Verdict) => {
      setBusyPlayerId(entry.playerId);
      setNotice(null);
      try {
        const result = await postAvatarVerdict(
          environment,
          entry.playerId,
          entry.submissionId,
          verdict
        );
        if (!result.ok) {
          setNotice("Игрок заменил фото — посмотрите ещё раз");
        }
      } catch {
        setError("Не удалось применить решение");
      } finally {
        setBusyPlayerId(null);
        // И после применённого вердикта, и после «устарело» — строка
        // перечитывается: в первом случае её больше нет, во втором в ней
        // теперь другая картинка.
        await reload();
      }
    },
    [environment, reload]
  );

  return (
    <Box flex={{ col: true }} width="100%">
      {error ? (
        <Box style={{ padding: 12, color: "var(--text-danger, #b00)" }}>{error}</Box>
      ) : null}
      {notice ? (
        <Box style={{ padding: 12, color: "var(--text-secondary)" }}>{notice}</Box>
      ) : null}

      {queue.length === 0 ? (
        <Box style={{ padding: 16, color: "var(--text-secondary)" }}>
          Фотографий на проверке нет
        </Box>
      ) : (
        queue.map((entry) => (
          <PendingAvatarRow
            key={entry.submissionId}
            apiUrl={environment.apiUrl}
            entry={entry}
            busy={busyPlayerId === entry.playerId}
            onDecide={(e, verdict) => void decide(e, verdict)}
          />
        ))
      )}
    </Box>
  );
};

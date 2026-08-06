"use client";

import { FC, useEffect, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { getAuthToken } from "@/core/states/auth/authTokenStorage";
import { PendingAvatar } from "@/core/states/avatarModeration/requests/getAvatarQueue";
import { Verdict } from "@/core/states/avatarModeration/requests/postAvatarVerdict";

export interface PendingAvatarRowProps {
  readonly apiUrl: string;
  readonly entry: PendingAvatar;
  readonly busy: boolean;
  readonly onDecide: (entry: PendingAvatar, verdict: Verdict) => void;
}

/**
 * Одна строка очереди: чья картинка, когда пришла, сколько раз этому игроку
 * уже отказывали, и сама картинка — ровно такая, какой она будет опубликована.
 *
 * Картинка берётся по авторизованному маршруту, не по публичному адресу:
 * у ждущей картинки публичного адреса нет, и `<img src>` сюда не годится —
 * браузер не пошлёт токен. Поэтому blob.
 */
export const PendingAvatarRow: FC<PendingAvatarRowProps> = ({
  apiUrl,
  entry,
  busy,
  onDecide,
}) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    const token = getAuthToken();
    void fetch(
      `${apiUrl}/v2/api/avatar-moderation/pending/${entry.playerId}/image`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (!blob) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => undefined);

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // Пересобираем, когда меняется именно заявка: подменённая картинка — это
    // другая submissionId, и показать надо новую.
  }, [apiUrl, entry.playerId, entry.submissionId]);

  return (
    <Box
      flex={{ gap: 3, align: "center" }}
      style={{
        padding: 12,
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={64}
          height={64}
          style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
        />
      ) : (
        <Box style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--background-secondary)" }} />
      )}

      <Box flex={{ col: true, gap: 1 }} style={{ flex: 1, minWidth: 0 }}>
        <span style={{ color: "var(--text-primary)" }}>Игрок #{entry.playerId}</span>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          {new Date(entry.submittedAt).toLocaleString("ru-RU")}
          {entry.refusalCount > 0
            ? ` · отказов раньше: ${entry.refusalCount}`
            : ""}
        </span>
      </Box>

      <Box flex={{ gap: 2 }}>
        <Button
          type="accent"
          size="small"
          disabled={busy}
          onClick={() => onDecide(entry, "allow")}
        >
          Разрешить
        </Button>
        <Button
          size="small"
          disabled={busy}
          onClick={() => onDecide(entry, "refuse")}
        >
          Отклонить
        </Button>
      </Box>
    </Box>
  );
};

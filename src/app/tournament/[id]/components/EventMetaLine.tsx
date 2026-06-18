import { FC } from "react";
import { Typography } from "@/components/Typography/Typography";
import { Formatter } from "@/components/Formatter/Formatter";
import { DateTime } from "luxon";

const ELIMINATION_TYPE_LABEL: Record<"Rebuy" | "Out", string> = {
  Out: "Аут",
  Rebuy: "Ребай",
};

/**
 * Вторичная строка под именами в модалках баунти («Кто меня выбил» / «Показать баунти»):
 * тип выбивания (Аут/Ребай) и время (HH:mm) события из bountyEliminationEvents.
 * Если данных нет — ничего не рендерит.
 */
export const EventMetaLine: FC<{
  type?: "Rebuy" | "Out";
  recordedAt?: number | null;
}> = ({ type, recordedAt }) => {
  const typeLabel = type ? ELIMINATION_TYPE_LABEL[type] : null;
  const hasTime =
    typeof recordedAt === "number" && Number.isFinite(recordedAt);
  if (!typeLabel && !hasTime) {
    return null;
  }
  return (
    <Typography.Text type="secondary" size="xxSmall">
      {typeLabel}
      {typeLabel && hasTime ? " · " : null}
      {hasTime ? (
        <Formatter.dateTime
          value={DateTime.fromMillis(recordedAt as number)}
          type="time"
        />
      ) : null}
    </Typography.Text>
  );
};

import { DateTime } from "luxon";
import { FC } from "react";

export interface DateTimeFormatterProps {
  readonly value: number | DateTime;
  readonly type?: "date" | "time";
}

const formatMap: Record<"date" | "time", string> = {
  date: "dd.MM.yyyy",
  time: "HH:mm",
};

export const DateTimeFormatter: FC<DateTimeFormatterProps> = ({
  value,
  type = "date",
}) => {
  const normalizedDate =
    value instanceof DateTime ? value : DateTime.fromSeconds(value);

  return normalizedDate.toLocal().toFormat(formatMap[type]);
};

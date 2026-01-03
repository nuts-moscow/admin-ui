import { DateTime } from "luxon";
import { FC } from "react";

export interface DateTimeFormatterProps {
  readonly value: number | DateTime;
  readonly type?: "date" | "time";
}

const formatMap: Record<"date" | "time", Intl.DateTimeFormatOptions> = {
  date: DateTime.DATE_SHORT,
  time: DateTime.TIME_24_WITH_SECONDS,
};

export const DateTimeFormatter: FC<DateTimeFormatterProps> = ({
  value,
  type = "date",
}) => {
  const normalizedDate =
    value instanceof DateTime ? value : DateTime.fromMillis(value);

  return normalizedDate.toLocaleString(formatMap[type], { locale: "en-US" });
};


import { FC, useMemo } from "react";

const mapTypeToFormatter = (
  type: NumberFormatterProps["type"],
  decimals: number
) => {
  switch (type) {
    case "withoutDecimals":
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
        useGrouping: true,
      });
    case "2digit":
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        useGrouping: true,
      });
    default:
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
        useGrouping: true,
      });
  }
};

export interface NumberFormatterProps {
  readonly value: number;
  readonly decimals?: number;
  readonly type?: "default" | "withoutDecimals" | "2digit";
}

const InnerNumberFormatter: FC<NumberFormatterProps> = ({
  value,
  decimals = 2,
  type = "default",
}) => {
  const formatter = useMemo(
    () => mapTypeToFormatter(type, decimals),
    [decimals, type]
  );

  return <>{formatter.format(value)}</>;
};

// @ts-expect-error-ignore
export const NumberFormatter: typeof InnerNumberFormatter & {
  getFormatter: typeof mapTypeToFormatter;
} = InnerNumberFormatter;

NumberFormatter.getFormatter = mapTypeToFormatter;

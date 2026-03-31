/** Отображение долей баунти (в т.ч. дробных после деления 1/N). */
export const formatBountyCount = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
    useGrouping: false,
  });
};

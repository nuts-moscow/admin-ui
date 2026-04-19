/** Месяц 1 = январь. */
const MONTH_NAMES_RU = [
  "",
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
] as const;

export function formatSeasonLong(
  year: number | null | undefined,
  month: number | null | undefined,
): string {
  if (
    year == null ||
    month == null ||
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    return "Сезон не задан";
  }
  const name = MONTH_NAMES_RU[month] ?? `месяц ${month}`;
  return `${name} ${Math.trunc(year)}`;
}

export function seasonSelectMonthOptions(): { value: number; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    return { value: m, label: MONTH_NAMES_RU[m] ?? String(m) };
  });
}

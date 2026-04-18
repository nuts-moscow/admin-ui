import type { RatingTableSummary } from "../requests/getRatingTables";

/** Подписи в UI для известных id таблиц рейтинга (имена с API подменяются). */
export function getRatingTableDisplayName(
  table: Pick<RatingTableSummary, "id" | "name">,
): string {
  switch (table.id) {
    case 1:
      return "Классический формат";
    case 2:
      return "Мистери формат";
    default:
      return table.name;
  }
}

/**
 * Подпись таблицы рейтинга без GET /rating-tables (эфир, таймер, /display) —
 * только id из турнира, чтобы не требовать JWT.
 */
export function getRatingTableDisplayNameForBroadcast(tournament: {
  readonly ratingTableId?: number;
}): string | undefined {
  if (tournament.ratingTableId == null) {
    return undefined;
  }
  const id = tournament.ratingTableId;
  return getRatingTableDisplayName({
    id,
    name: `Таблица ${id}`,
  });
}

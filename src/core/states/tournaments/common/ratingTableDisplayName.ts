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

import { DateTime } from "luxon";

/** Как в PageHeader / DateTimeFormatter type="date": имя турнира и дата через пробел. */
export function formatTournamentPageTitle(t: {
  readonly name: string;
  readonly date: number;
}): string {
  const datePart = DateTime.fromSeconds(t.date).toLocal().toFormat("dd.MM.yyyy");
  return `${t.name} ${datePart}`;
}

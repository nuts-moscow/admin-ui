import { DateTime } from "luxon";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { formatBountyCount } from "@/core/states/tournaments/common/formatBountyCount";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { displayPlaceNumber } from "../TournamentResults/tournamentResultsCopyText";

/** Табуляция — удобно вставлять в Excel / Google Sheets. */
const SEP = "\t";

function numCell(n: number | undefined | null): string {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return String(v);
}

function bountyKillsCell(row: InGamePlayerState): string {
  const bc = row.bountyCount ?? 0;
  if (!Number.isFinite(bc) || bc <= 0) {
    return "—";
  }
  return `${formatBountyCount(bc)} 🥥`;
}

function nonPlacementAccruedCell(row: InGamePlayerState): number {
  return (
    row.ratingNonPlacementAccrued ?? row.rating?.nonPlacementAccrued ?? 0
  );
}

function totalPointsCell(row: InGamePlayerState): number {
  const r = row.rating;
  if (r != null) {
    return r.totalPoints;
  }
  return nonPlacementAccruedCell(row);
}

function fromTableCell(row: InGamePlayerState): number {
  return row.rating?.fromTable ?? 0;
}

function bountyPointsCell(row: InGamePlayerState): number {
  return row.rating?.bounty ?? 0;
}

/**
 * Полная таблица рейтинга для буфера: заголовок, строка колонок (TSV), данные.
 * Для завершённого турнира включается колонка «Корр.».
 */
export function buildTournamentRatingTableCopyText(
  rows: readonly InGamePlayerState[],
  tournament: Pick<TournamentInfoResponse, "name" | "date" | "status">,
  totalPlayers: number,
): string {
  const dateLine = DateTime.fromSeconds(tournament.date)
    .toLocal()
    .toFormat("dd.MM.yyyy");
  const isCompleted = tournament.status === "Completed";
  const title = isCompleted
    ? `ИТОГОВЫЕ БАЛЛЫ — ${tournament.name}, ${dateLine}`
    : `БАЛЛЫ ИГРОКОВ — ${tournament.name}, ${dateLine}`;

  const header = isCompleted
    ? [
        "Место",
        "Игрок",
        "За место",
        "Баунти (баллы)",
        "Баунти",
        "Доп. баллы",
        "Корр.",
        "Итого",
      ].join(SEP)
    : [
        "Место",
        "Игрок",
        "За место",
        "Баунти (баллы)",
        "Баунти",
        "Доп. баллы",
        "Итого",
      ].join(SEP);

  const body = rows.map((row) => {
    const place = displayPlaceNumber(
      row.placement,
      totalPlayers,
      tournament.status,
    );
    const placeStr = place != null ? String(place) : "—";
    const cells = [
      placeStr,
      row.playerName.replace(/\r?\n/g, " "),
      numCell(fromTableCell(row)),
      numCell(bountyPointsCell(row)),
      bountyKillsCell(row),
      numCell(nonPlacementAccruedCell(row)),
    ];
    if (isCompleted) {
      cells.push(
        numCell(row.rating?.manualAdjustment ?? 0),
        numCell(totalPointsCell(row)),
      );
    } else {
      cells.push(numCell(totalPointsCell(row)));
    }
    return cells.join(SEP);
  });

  return [title, "", header, ...body].join("\n");
}

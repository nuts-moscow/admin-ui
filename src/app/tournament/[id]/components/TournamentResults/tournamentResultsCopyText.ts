import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { TournamentStatus } from "@/core/states/tournaments/common/TournamentStatus";
import { formatBountyCount } from "@/core/states/tournaments/common/formatBountyCount";

/** Завершённый турнир: порядок и место как на бэке без «переворота». Идёт игра и др.: прежняя «живая» логика. */
export function isFinalPlacementOrder(status: TournamentStatus): boolean {
  return status === "Completed";
}

export function sortTournamentResultsRows(
  players: readonly InGamePlayerState[],
  tournamentStatus: TournamentStatus,
): InGamePlayerState[] {
  const list = [...players];
  const noPlacement = list.filter((r) => r.placement == null);
  const withPlacement = list.filter((r) => r.placement != null);
  const byTournamentPlayerId = (
    a: InGamePlayerState,
    b: InGamePlayerState,
  ) => {
    const idA = a.tournamentPlayerId ?? a.playerId;
    const idB = b.tournamentPlayerId ?? b.playerId;
    const nA = typeof idA === "number" ? idA : parseInt(String(idA), 10) || 0;
    const nB = typeof idB === "number" ? idB : parseInt(String(idB), 10) || 0;
    if (nA !== nB) return nA - nB;
    return String(idA).localeCompare(String(idB));
  };
  const finalOrder = isFinalPlacementOrder(tournamentStatus);
  const byPlacement = finalOrder
    ? (a: InGamePlayerState, b: InGamePlayerState) =>
        (a.placement ?? 0) - (b.placement ?? 0)
    : (a: InGamePlayerState, b: InGamePlayerState) =>
        (b.placement ?? 0) - (a.placement ?? 0);
  noPlacement.sort(byTournamentPlayerId);
  withPlacement.sort(byPlacement);
  return [...noPlacement, ...withPlacement];
}

export function displayPlaceNumber(
  placement: number | null | undefined,
  totalPlayers: number,
  tournamentStatus: TournamentStatus,
): number | null {
  if (placement == null) {
    return null;
  }
  if (isFinalPlacementOrder(tournamentStatus)) {
    return placement;
  }
  return totalPlayers - placement + 1;
}

/** Текст для буфера: места и баунти, как кнопка «Скопировать» на вкладке результатов. */
export function buildTournamentResultsCopyText(
  players: readonly InGamePlayerState[],
  tournamentStatus: TournamentStatus,
): string {
  const rows = sortTournamentResultsRows(players, tournamentStatus);
  const totalPlayers = rows.length;
  return rows
    .map((row) => {
      const rank = displayPlaceNumber(
        row.placement,
        totalPlayers,
        tournamentStatus,
      );
      return `${rank ?? "-"}. ${row.playerName} — Баунти: ${formatBountyCount(row.bountyCount)}`;
    })
    .join("\n");
}

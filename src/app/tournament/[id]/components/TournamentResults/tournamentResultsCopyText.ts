import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { formatBountyCount } from "@/core/states/tournaments/common/formatBountyCount";

export function sortTournamentResultsRows(
  players: readonly InGamePlayerState[],
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
  const byPlacementDesc = (a: InGamePlayerState, b: InGamePlayerState) =>
    (b.placement ?? 0) - (a.placement ?? 0);
  noPlacement.sort(byTournamentPlayerId);
  withPlacement.sort(byPlacementDesc);
  return [...noPlacement, ...withPlacement];
}

/** Текст для буфера: места и баунти, как кнопка «Скопировать» на вкладке результатов. */
export function buildTournamentResultsCopyText(
  players: readonly InGamePlayerState[],
): string {
  const rows = sortTournamentResultsRows(players);
  const totalPlayers = rows.length;
  const placeNumber = (placement: number | null | undefined) =>
    placement != null ? totalPlayers - placement + 1 : null;
  return rows
    .map(
      (row) =>
        `${placeNumber(row.placement) ?? "-"}. ${row.playerName} — Баунти: ${formatBountyCount(row.bountyCount)}`,
    )
    .join("\n");
}

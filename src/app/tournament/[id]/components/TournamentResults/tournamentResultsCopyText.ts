import { DateTime } from "luxon";
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

function formatTournamentDateLine(epochSeconds: number): string {
  return DateTime.fromSeconds(epochSeconds).toLocal().toFormat("dd.MM.yyyy");
}

function bountyCopySuffix(bountyCount: number): string {
  if (!Number.isFinite(bountyCount) || bountyCount <= 0) {
    return "";
  }
  return ` (${formatBountyCount(bountyCount)} 🥥)`;
}

function formatResultsCopyLine(
  rank: number | null,
  playerName: string,
  bountyCount: number,
): string {
  const suffix = bountyCopySuffix(bountyCount);
  if (rank === 1) {
    return `🥇${playerName}${suffix}`;
  }
  if (rank === 2) {
    return `🥈${playerName}${suffix}`;
  }
  if (rank === 3) {
    return `🥉 ${playerName}${suffix}`;
  }
  if (rank == null) {
    return `${playerName}${suffix}`;
  }
  return `${rank}. ${playerName}${suffix}`;
}

/**
 * Текст для буфера: заголовок с датой, места с медалями и баунти в формате «(N 🥥)».
 */
export function buildTournamentResultsCopyText(
  players: readonly InGamePlayerState[],
  tournamentStatus: TournamentStatus,
  tournamentDateEpochSeconds: number,
): string {
  const rows = sortTournamentResultsRows(players, tournamentStatus);
  const totalPlayers = rows.length;
  const header = `РЕЗУЛЬТАТЫ ИГРЫ, ${formatTournamentDateLine(
    tournamentDateEpochSeconds,
  )}`;
  const body = rows.map((row) => {
    const rank = displayPlaceNumber(
      row.placement,
      totalPlayers,
      tournamentStatus,
    );
    return formatResultsCopyLine(rank, row.playerName, row.bountyCount);
  });
  return [header, "", ...body].join("\n");
}

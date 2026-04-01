import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";

function parseRegistrationId(player: InGamePlayerState): number {
  const raw = player.tournamentPlayerId ?? player.playerId;
  const n =
    typeof raw === "number" ? raw : Number.parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function buildTelegramParticipantsListText(options: {
  readonly players: readonly InGamePlayerState[];
  readonly playersLimit: number | undefined;
}): string {
  const { players, playersLimit } = options;

  const byRegId = new Map<number, InGamePlayerState>();
  let maxRegId = 0;
  for (const p of players) {
    const id = parseRegistrationId(p);
    if (id > 0) {
      byRegId.set(id, p);
      maxRegId = Math.max(maxRegId, id);
    }
  }

  /** До последнего номера записи + 5 свободных мест, без превышения лимита турнира. */
  const withFreeSlots = maxRegId + 5;
  const totalLines =
    playersLimit != null
      ? Math.min(playersLimit, withFreeSlots)
      : withFreeSlots;

  const lines: string[] = ["СПИСОК УЧАСТНИКОВ", ""];

  /**
   * Слева номера строк подряд (1, 2, 3…). Если номер записи в турнире пропущен (нет игрока),
   * отдельной пустой строки нет — на эту позицию в списке попадает следующий по записи игрок;
   * фактический номер записи только в скобках. Пустые строки — только в хвосте (свободные места).
   */
  let lineIndex = 1;
  for (let seat = 1; seat <= totalLines; seat++) {
    const player = byRegId.get(seat);
    if (player) {
      const regId = parseRegistrationId(player);
      lines.push(`${lineIndex}. ${player.playerName} (${regId})`);
      lineIndex++;
    } else if (seat > maxRegId) {
      lines.push(`${lineIndex}.`);
      lineIndex++;
    }
  }

  lines.push("", "Для записи на игру поставьте😀 в чат или напишите @nuts_mate 💜");

  return lines.join("\n");
}

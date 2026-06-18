"use client";

import { FC, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { toast } from "@/components/Toast/Toast";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { bountyEliminateUndo } from "@/core/states/tournaments/requests/bountyEliminate";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { refetchTournamentRebuyCount } from "@/core/states/tournaments/hooks/useTournamentRebuyCount";
import { EventMetaLine } from "@/app/tournament/[id]/components/EventMetaLine";
import { Sheet } from "../../components/Sheet";
import { mobileCardCls } from "../../mobile.css";

export type BountyEventsMode = "eliminatedBy" | "kills";

export interface BountyEventsSheetProps {
  readonly tournamentId: string;
  readonly player: InGamePlayerState | null;
  readonly players: InGamePlayerState[];
  readonly mode: BountyEventsMode;
  readonly onClose: () => void;
}

/** «Кто меня выбил» (eliminatedBy) / «Показать баунти» (kills) — тип, время, откат события. */
export const BountyEventsSheet: FC<BountyEventsSheetProps> = ({
  tournamentId,
  player,
  players,
  mode,
  onClose,
}) => {
  const environment = useEnvironment();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const playerId = String(player?.playerId ?? "");
  const events = useMemo(() => {
    const raw = player?.bountyEliminationEvents ?? [];
    const filtered = raw.filter((ev) =>
      mode === "eliminatedBy"
        ? String(ev.eliminatedPlayerId) === playerId
        : ev.killerPlayerIds.some((k) => String(k) === playerId),
    );
    const seen = new Set<string>();
    return filtered.filter((ev) => {
      if (seen.has(ev.eventId)) {
        return false;
      }
      seen.add(ev.eventId);
      return true;
    });
  }, [player?.bountyEliminationEvents, playerId, mode]);

  if (!player) {
    return null;
  }

  const nameById = (id: string) =>
    players.find((p) => String(p.playerId) === String(id))?.playerName ?? id;

  const undo = async (eventId: string) => {
    setRemovingId(eventId);
    try {
      await bountyEliminateUndo(environment, Number(tournamentId), { eventId });
      refetchTournamentPlayerState();
      refetchTournamentRebuyCount();
      onClose();
    } catch {
      toast({ type: "error", message: "Не удалось отменить запись" });
    } finally {
      setRemovingId(null);
    }
  };

  const title =
    mode === "eliminatedBy"
      ? `Кто меня выбил — ${player.playerName}`
      : `Баунти — ${player.playerName}`;

  return (
    <Sheet open onClose={onClose} title={title}>
      {events.length === 0 ? (
        <Typography.Text type="secondary" size="small">
          Нет записей
        </Typography.Text>
      ) : (
        events.map((ev, index) => {
          const label =
            mode === "eliminatedBy"
              ? ev.killerPlayerIds.map(nameById).join(", ")
              : nameById(ev.eliminatedPlayerId);
          return (
            <Box
              key={`${ev.eventId}-${index}`}
              flex={{ align: "center", justify: "space-between", gap: 2 }}
              className={mobileCardCls}
              style={{ flexDirection: "row" }}
            >
              <Box flex={{ col: true, gap: 0 }}>
                <Typography.Text size="small">{label}</Typography.Text>
                <EventMetaLine type={ev.type} recordedAt={ev.recordedAt} />
              </Box>
              <Button
                type="ghost"
                size="small"
                iconRight={<X size={18} color="var(--text-error)" />}
                onClick={() => undo(ev.eventId)}
                disabled={removingId !== null}
                loading={removingId === ev.eventId}
                aria-label="Отменить"
              />
            </Box>
          );
        })
      )}
    </Sheet>
  );
};

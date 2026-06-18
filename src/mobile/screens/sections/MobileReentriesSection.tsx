"use client";

import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { useNonRegisteredTournamentPlayerState } from "@/core/states/tournaments/hooks/useNonRegisteredTournamentPlayerState";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { formatBountyCount } from "@/core/states/tournaments/common/formatBountyCount";
import { mobileCardCls } from "../../mobile.css";
import { BountyEventsSheet, BountyEventsMode } from "./BountyEventsSheet";

export const MobileReentriesSection: FC<{ tournamentId: string }> = ({
  tournamentId,
}) => {
  const { data: players = [] } =
    useNonRegisteredTournamentPlayerState(tournamentId);
  const [open, setOpen] = useState<{
    player: InGamePlayerState;
    mode: BountyEventsMode;
  } | null>(null);

  const live = open
    ? players.find((p) => p.playerId === open.player.playerId) ?? open.player
    : null;

  return (
    <>
      {players.length === 0 ? (
        <Typography.Text type="secondary" size="small">
          Нет участников
        </Typography.Text>
      ) : (
        players.map((p) => (
          <Box key={p.playerId} className={mobileCardCls} flex={{ col: true, gap: 2 }}>
            <Typography.Text bold>
              {p.tournamentPlayerId} · {p.playerName}
            </Typography.Text>
            <Typography.Text type="secondary" size="small">
              Ребаи: {p.totalReentryCount ?? 0} · Баунти:{" "}
              {formatBountyCount(p.bountyCount ?? 0)}
            </Typography.Text>
            <Box flex={{ gap: 2, width: "100%" }}>
              <Button
                type="secondary"
                size="small"
                flexItem={{ flex: 1 }}
                onClick={() => setOpen({ player: p, mode: "eliminatedBy" })}
              >
                Кто выбил
              </Button>
              <Button
                type="secondary"
                size="small"
                flexItem={{ flex: 1 }}
                onClick={() => setOpen({ player: p, mode: "kills" })}
              >
                Баунти
              </Button>
            </Box>
          </Box>
        ))
      )}
      <BountyEventsSheet
        tournamentId={tournamentId}
        player={live}
        players={players}
        mode={open?.mode ?? "eliminatedBy"}
        onClose={() => setOpen(null)}
      />
    </>
  );
};

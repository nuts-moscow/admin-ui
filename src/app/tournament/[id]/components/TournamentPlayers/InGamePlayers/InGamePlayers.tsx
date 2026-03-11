"use client";

import { FC } from "react";
import { Button } from "@/components/Button/Button";
import { PlayerListCard } from "../PlayerListCard/PlayerListCard";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";

const MOCK_ROWS: InGamePlayerState[] = Array.from({ length: 9 }, (_, i) => ({
  playerId: i + 1,
  playerName: "Имя",
  status: i === 5 ? "InGameNotPaid" : "InGamePaid",
  reentryCount: 0,
  bountyCount: 0,
  paidReentryCount: 0,
  freeReentryCount: 0,
}));

export const InGamePlayers: FC = () => {
  return (
    <PlayerListCard
      title="На игре"
      count={40}
      rows={MOCK_ROWS}
      renderActions={(row) => (
        <>
          {row.playerId === 1 && (
            <Button type="error" size="xxSmall">
              1 стол
            </Button>
          )}
          {row.status === "InGameNotPaid" && (
            <Button type="warning" size="xxSmall">
              Оплатить
            </Button>
          )}
          <Button type="error" size="xxSmall">
            Стол
          </Button>
        </>
      )}
    />
  );
};

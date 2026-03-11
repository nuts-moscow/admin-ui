"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { X } from "lucide-react";
import { PlayerListCard } from "../PlayerListCard/PlayerListCard";
import { AddPlayerButton } from "./AddPlayerButton/AddPlayerButton";
import { useRegisteredTournamentPlayerState } from "@/core/states/tournaments/hooks/useRegisteredTournamentPlayerState";

export interface WaitingListPlayersProps {
  readonly tournamentId: string;
}

export const WaitingListPlayers: FC<WaitingListPlayersProps> = ({
  tournamentId,
}) => {
  const { data: registeredPlayers } = useRegisteredTournamentPlayerState(
    tournamentId
  );
  const rows = registeredPlayers ?? [];

  return (
    <PlayerListCard
      title={
        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text size="small" bold>
            Запись
          </Typography.Text>
          <AddPlayerButton />
        </Box>
      }
      count={rows.length}
      rows={rows}
      renderActions={() => (
        <>
          <Button type="success" size="xxSmall">
            Пришел и оплатил
          </Button>
          <Button type="secondary" size="xxSmall">
            Пришел
          </Button>
          <Button type="ghost" size="xxSmall" iconRight={<X size={16} />} />
        </>
      )}
    />
  );
};

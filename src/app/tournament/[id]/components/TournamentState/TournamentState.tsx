"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";

export interface TournamentStateProps {
  readonly tournamentId: string;
}

export const TournamentState: FC<TournamentStateProps> = ({
  tournamentId,
}) => {
  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <Typography.Text>Состояние турнира</Typography.Text>
    </Box>
  );
};

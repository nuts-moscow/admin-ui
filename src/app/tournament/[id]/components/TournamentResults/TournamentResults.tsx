"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";

export interface TournamentResultsProps {
  readonly tournamentId: string;
}

export const TournamentResults: FC<TournamentResultsProps> = ({
  tournamentId,
}) => {
  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <Typography.Text>Результаты турнира</Typography.Text>
    </Box>
  );
};

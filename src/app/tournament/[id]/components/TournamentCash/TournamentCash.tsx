"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";

export interface TournamentCashProps {
  readonly tournamentId: string;
}

export const TournamentCash: FC<TournamentCashProps> = ({ tournamentId }) => {
  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <Typography.Text>Касса турнира</Typography.Text>
    </Box>
  );
};

"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";

export interface TournamentReentriesProps {
  readonly tournamentId: string;
}

export const TournamentReentries: FC<TournamentReentriesProps> = ({
  tournamentId,
}) => {
  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <Typography.Text>Рибаи</Typography.Text>
    </Box>
  );
};

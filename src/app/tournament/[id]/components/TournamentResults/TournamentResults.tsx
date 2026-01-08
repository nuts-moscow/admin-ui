"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";

export interface TournamentResultsProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentResults: FC<TournamentResultsProps> = ({
  tournament,
}) => {
  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <Typography.Text>Результаты турнира</Typography.Text>
    </Box>
  );
};

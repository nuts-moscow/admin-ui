"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";

export interface TournamentCashProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentCash: FC<TournamentCashProps> = ({ tournament }) => {
  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <Typography.Text>Касса турнира</Typography.Text>
    </Box>
  );
};

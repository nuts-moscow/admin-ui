"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";

export interface TournamentTablesProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentTables: FC<TournamentTablesProps> = ({ tournament }) => {
  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <Button type="primary" size="medium">
        Добавить стол
      </Button>
      <Box flex={{ col: true, gap: 2, width: "100%" }}>
        <Typography.Text>Столы турнира</Typography.Text>
      </Box>
    </Box>
  );
};

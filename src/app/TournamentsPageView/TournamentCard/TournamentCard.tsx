"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";
import {
  tournamentCardCls,
  tournamentCardColumnCls,
} from "@/app/TournamentsPageView/TournamentCard/TournamentCard.css";
import { clsx } from "clsx";
import { DateTimeFormatter } from "@/components/Formatter/DateTimeFormatter/DateTimeFormatter";
import { TournamentStatus } from "@/core/states/tournaments/types";

interface TournamentMock {
  readonly id: string;
  readonly name: string;
  readonly date: number;
  readonly time: string;
  readonly structureName: string;
  readonly status: TournamentStatus;
}

export interface TournamentCardProps {
  readonly tournament: TournamentMock;
  readonly onClick?: () => void;
}

export const TournamentCard: FC<TournamentCardProps> = ({
  tournament,
  onClick,
}) => {
  const { name, date, time, structureName } = tournament;

  return (
    <Box
      flex={{ gap: 16, align: "center", width: "100%" }}
      padding={4}
      borderRadius="m"
      border
      className={tournamentCardCls}
      onClick={onClick}
    >
      <div className={clsx(tournamentCardColumnCls, "date-col")}>
        <Typography.Text size="small" type="secondary">
          Дата
        </Typography.Text>
        <Typography.Text>
          <DateTimeFormatter value={date} type="date" />
        </Typography.Text>
      </div>

      <div className={clsx(tournamentCardColumnCls, "time-col")}>
        <Typography.Text size="small" type="secondary">
          Время
        </Typography.Text>
        <Typography.Text>{time}</Typography.Text>
      </div>

      <div className={clsx(tournamentCardColumnCls, "type-col")}>
        <Typography.Text size="small" type="secondary">
          Тип турнира
        </Typography.Text>
        <Typography.Text size="small">{structureName}</Typography.Text>
      </div>

      <div className={clsx(tournamentCardColumnCls, "name-col")}>
        <Typography.Text size="small" type="secondary">
          Название турнира
        </Typography.Text>
        <Typography.Text>{name}</Typography.Text>
      </div>
    </Box>
  );
};

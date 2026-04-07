"use client";

import { FC } from "react";
import { TournamentChipPoolWindow } from "../components/TournamentChipPoolWindow/TournamentChipPoolWindow";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";

export interface TournamentDisplayShellProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentDisplayShell: FC<TournamentDisplayShellProps> = ({
  tournament,
}) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
        /** Совпадает с фоном турнирного окна — нет «белых» углов за скруглением. */
        backgroundColor: "#e5d6c4",
      }}
    >
      <TournamentChipPoolWindow
        tournament={tournament}
        showTvBroadcastLink={false}
      />
    </div>
  );
};

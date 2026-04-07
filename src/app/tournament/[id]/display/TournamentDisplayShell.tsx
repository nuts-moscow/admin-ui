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
        /**
         * Одного min-height мало: контейнер остаётся «по контенту», flex:1 у дочернего
         * чип-пула не получает остаток — снизу пустой градиент. Фиксируем высоту вьюпорта.
         */
        minHeight: "var(--app-min-page-height)",
        height: "var(--app-min-page-height)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
        /** Совпадает с фоном турнирного окна — нет «белых» углов за скруглением. */
        backgroundColor: "#d9c4ae",
      }}
    >
      <TournamentChipPoolWindow
        tournament={tournament}
        showTvBroadcastLink={false}
        style={{ flex: "1 1 0%", minHeight: 0, width: "100%" }}
      />
    </div>
  );
};

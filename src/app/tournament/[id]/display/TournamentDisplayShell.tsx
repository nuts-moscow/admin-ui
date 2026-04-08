"use client";

import { CSSProperties, FC } from "react";
import { TournamentChipPoolWindow } from "../components/TournamentChipPoolWindow/TournamentChipPoolWindow";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";

export interface TournamentDisplayShellProps {
  readonly tournament: TournamentInfoResponse;
}

/**
 * Страница /display всегда предназначена для ТВ/проектора.
 * Форсируем TV-режим CSS-переменных, чтобы не зависеть от
 * (hover: none) / (pointer: coarse) — ТВ-браузеры часто врут.
 */
const tvOverrides: CSSProperties & Record<string, string> = {
  "--chip-broadcast-title-size": "clamp(1.4rem, min(4.5vw, 7vh), 4.5rem)",
  "--chip-broadcast-stat-label-size":
    "clamp(0.88rem, min(1.65vw, 2.6vh), 1.4rem)",
  "--chip-broadcast-stat-value-size": "clamp(2rem, min(4.5vw, 8.5vh), 6rem)",
  "--chip-broadcast-stat-gap": "clamp(18px, 3.5vh, 48px)",
  "--chip-broadcast-logo-height": "clamp(76px, min(12vw, 15vh), 180px)",
  "--chip-broadcast-subheader-font":
    "clamp(0.8rem, min(1.5vw, 2.2vh), 1.15rem)",
  "--chip-broadcast-column-justify": "space-evenly",
  "--chip-broadcast-grid-align-items": "stretch",
  "--chip-broadcast-grid-align-content": "stretch",
  "--chip-broadcast-clock-justify": "space-evenly",
  "--chip-broadcast-clock-gap": "0px",
  "--chip-broadcast-inner-blinds-gap": "clamp(4px, 2vh, 40px)",
  "--bc-font-level": "clamp(1.2rem, min(3.2vw, 5.5vh), 3rem)",
  "--bc-font-blinds": "clamp(3.25rem, min(13vw, 20vh), 10rem)",
  "--bc-font-ante": "clamp(1.25rem, min(3.2vw, 5vh), 2.85rem)",
  "--bc-font-timer": "clamp(3.5rem, min(14vw, 22vh), 14rem)",
  "--bc-font-next": "clamp(1.2rem, min(3.4vw, 5vh), 3rem)",
  "--bc-timer-pad-y": "clamp(16px, min(4vw, 5vh), 56px)",
  "--bc-timer-pad-x": "clamp(24px, min(8vw, 6vh), 160px)",
  "--bc-timer-max-width": "min(100%, 96vw)",
};

export const TournamentDisplayShell: FC<TournamentDisplayShellProps> = ({
  tournament,
}) => {
  return (
    <div
      style={{
        minHeight: "var(--app-min-page-height)",
        height: "var(--app-min-page-height)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#d9c4ae",
        ...tvOverrides,
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

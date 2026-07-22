"use client";

import { CSSProperties, FC } from "react";
import { TournamentChipPoolWindow } from "../components/TournamentChipPoolWindow/TournamentChipPoolWindow";
import { WifiQr } from "@/components/WifiQr/WifiQr";
import { useTournament } from "@/core/states/tournaments/hooks/useTournament";

export interface TournamentDisplayShellProps {
  readonly tournamentId: string;
}

/**
 * Страница /display всегда предназначена для ТВ/проектора.
 * Форсируем TV-режим CSS-переменных, чтобы не зависеть от
 * (hover: none) / (pointer: coarse) — ТВ-браузеры часто врут.
 */
const tvOverrides: CSSProperties & Record<string, string> = {
  "--chip-broadcast-title-size": "clamp(1.1rem, min(2.5vw, 4vh), 2.5rem)",
  "--chip-broadcast-stat-label-size":
    "clamp(0.88rem, min(1.65vw, 2.6vh), 1.4rem)",
  "--chip-broadcast-stat-value-size": "clamp(1.75rem, min(3vw, 5vh), 3.5rem)",
  "--chip-broadcast-stat-gap": "clamp(12px, 2.5vh, 32px)",
  "--chip-broadcast-logo-height": "clamp(76px, min(12vw, 15vh), 180px)",
  "--chip-broadcast-subheader-font":
    "clamp(0.8rem, min(1.5vw, 2.2vh), 1.15rem)",
  "--chip-broadcast-column-justify": "space-evenly",
  "--chip-broadcast-rating-zone-padding-top": "clamp(9vh, 11vmin, 200px)",
  "--chip-broadcast-grid-align-items": "stretch",
  "--chip-broadcast-grid-align-content": "stretch",
  "--chip-broadcast-clock-justify": "space-evenly",
  "--chip-broadcast-clock-gap": "0px",
  "--chip-broadcast-inner-blinds-gap": "clamp(4px, 2vh, 40px)",
  "--bc-font-level": "clamp(1.2rem, min(3.2vw, 5.5vh), 3rem)",
  "--bc-font-blinds": "clamp(2.75rem, min(7vw, 11vh), 5.5rem)",
  "--bc-font-ante": "clamp(1.25rem, min(3.2vw, 5vh), 2.85rem)",
  "--bc-font-timer": "clamp(3rem, min(7.5vw, 12vh), 6rem)",
  "--bc-font-next": "clamp(1.2rem, min(3.4vw, 5vh), 3rem)",
  "--bc-timer-pad-y": "clamp(10px, min(2.5vw, 3vh), 32px)",
  "--bc-timer-pad-x": "clamp(24px, min(5vw, 4vh), 80px)",
  "--bc-timer-max-width": "min(100%, 36vw)",
};

export const TournamentDisplayShell: FC<TournamentDisplayShellProps> = ({
  tournamentId,
}) => {
  const { data: tournament } = useTournament(tournamentId);

  if (!tournament) {
    return null;
  }

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
        enablePublicRatingPointsPreview
        style={{ flex: "1 1 0%", minHeight: 0, width: "100%" }}
      />
      <WifiQr
        style={{
          position: "absolute",
          left: "clamp(24px, 6vw, 88px)",
          top: "calc(var(--chip-broadcast-logo-height) + clamp(28px, 5vh, 72px))",
          zIndex: 10,
        }}
      />
    </div>
  );
};

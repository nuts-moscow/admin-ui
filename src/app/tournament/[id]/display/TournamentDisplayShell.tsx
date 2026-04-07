"use client";

import { FC, useCallback } from "react";
import { TournamentChipPoolWindow } from "../components/TournamentChipPoolWindow/TournamentChipPoolWindow";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { Button } from "@/components/Button/Button";
import { Maximize2 } from "lucide-react";

export interface TournamentDisplayShellProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentDisplayShell: FC<TournamentDisplayShellProps> = ({
  tournament,
}) => {
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      void el.requestFullscreen().catch(() => {
        /* пользователь или политика браузера */
      });
    }
  }, []);

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
        backgroundColor: "#e8dfd4",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 50,
          opacity: 0.45,
        }}
      >
        <Button
          type="secondary"
          size="small"
          iconLeft={<Maximize2 size={18} />}
          htmlType="button"
          onClick={enterFullscreen}
          style={{ pointerEvents: "auto" }}
        >
          Полный экран
        </Button>
      </div>
      <TournamentChipPoolWindow
        tournament={tournament}
        showTvBroadcastLink={false}
      />
    </div>
  );
};

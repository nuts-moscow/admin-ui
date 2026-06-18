"use client";

import { FC, useMemo, useState } from "react";
import { Typography } from "@/components/Typography/Typography";
import { useNonRegisteredTournamentPlayerState } from "@/core/states/tournaments/hooks/useNonRegisteredTournamentPlayerState";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import { getPaymentMethodLabel } from "@/core/states/tournaments/common/paymentMethodLabels";
import { mobileCardCls } from "../../mobile.css";
import { PlayerActionSheet } from "./PlayerActionSheet";

const STATUS_LABEL: Record<string, string> = {
  InGamePaid: "В игре",
  InGameNotPaid: "В игре",
  Out: "Выбыл",
  OutNotPaid: "Выбыл",
};

const isOutStatus = (p: InGamePlayerState) =>
  p.status === "Out" || p.status === "OutNotPaid";

export const MobilePlayersSection: FC<{ tournamentId: string }> = ({
  tournamentId,
}) => {
  const { data: players = [] } =
    useNonRegisteredTournamentPlayerState(tournamentId);
  const [selected, setSelected] = useState<InGamePlayerState | null>(null);

  const rows = useMemo(
    () =>
      [...players].sort(
        (a, b) => Number(isOutStatus(a)) - Number(isOutStatus(b)),
      ),
    [players],
  );

  // Держим выбранного игрока в актуальном состоянии после рефетча.
  const selectedLive = selected
    ? players.find((p) => p.playerId === selected.playerId) ?? selected
    : null;

  return (
    <>
      {rows.length === 0 ? (
        <Typography.Text type="secondary" size="small">
          Нет игроков на игре
        </Typography.Text>
      ) : (
        rows.map((p) => {
          const method = p.entryPaymentMethod ?? p.entyPaymentMethod;
          return (
            <button
              key={p.playerId}
              type="button"
              className={mobileCardCls}
              style={{
                textAlign: "left",
                width: "100%",
                cursor: "pointer",
                font: "inherit",
                color: "inherit",
                opacity: isOutStatus(p) ? 0.6 : 1,
              }}
              onClick={() => setSelected(p)}
            >
              <Typography.Text bold>
                {p.tournamentPlayerId} · {p.playerName}
              </Typography.Text>
              <Typography.Text type="secondary" size="small">
                {STATUS_LABEL[p.status] ?? p.status}
                {p.tableId != null ? ` · Стол ${p.tableId}` : ""}
                {method ? ` · ${getPaymentMethodLabel(method)}` : " · не оплачен"}
              </Typography.Text>
            </button>
          );
        })
      )}
      <PlayerActionSheet
        tournamentId={tournamentId}
        player={selectedLive}
        players={players}
        onClose={() => setSelected(null)}
      />
    </>
  );
};

import { FC, ReactNode } from "react";
import { Typography } from "@/components/Typography/Typography";
import { clsx } from "clsx";
import { InGamePlayerState } from "@/core/states/tournaments/common/InGamePlayerState";
import {
  playerListCardCls,
  playerListCardHeaderCls,
  playerListCardBodyCls,
  playerListRowCls,
  playerListRowHighlightCls,
  playerListRowMutedCls,
  playerListRowNumberCls,
  playerListRowNameCls,
  playerListRowActionsCls,
} from "./PlayerListCard.css";

export interface PlayerListCardProps {
  readonly title: ReactNode;
  readonly count: number;
  readonly rows: InGamePlayerState[];
  readonly renderActions?: (row: InGamePlayerState) => ReactNode;
}

export const PlayerListCard: FC<PlayerListCardProps> = ({
  title,
  count,
  rows,
  renderActions,
}) => {
  return (
    <div className={playerListCardCls}>
      <div className={playerListCardHeaderCls}>
        {title}
        <Typography.Text size="small" type="secondary">
          {count}
        </Typography.Text>
      </div>
      <div className={playerListCardBodyCls}>
        {rows.map((row, index) => {
          const actions = renderActions?.(row);

          return (
            <div
              key={index}
              className={clsx(
                playerListRowCls,
                row.status === "InGameNotPaid" && playerListRowHighlightCls,
                row.status === "Registered" && playerListRowMutedCls
              )}
            >
              <Typography.Text
                size="small"
                type="secondary"
                className={playerListRowNumberCls}
              >
                {row.tournamentPlayerId ?? row.playerId}
              </Typography.Text>
              <Typography.Text size="small" className={playerListRowNameCls}>
                {row.playerName}
              </Typography.Text>
              {actions && (
                <div className={playerListRowActionsCls}>{actions}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

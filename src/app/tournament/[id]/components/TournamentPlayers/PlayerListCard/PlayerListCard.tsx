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
  playerListRowNoAgreementCls,
  playerListRowNumberCls,
  playerListRowNameBlockCls,
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
          const hasEntryPayment =
            (row.entryPaymentMethod ?? row.entyPaymentMethod) != null;
          const isOutOrOutNotPaid =
            row.status === "Out" || row.status === "OutNotPaid";
          const needsEntryHighlight =
            row.status === "InGameNotPaid" ||
            (isOutOrOutNotPaid && !hasEntryPayment);

          const paymentSummary: string[] = [];
          if (row.entryPaidAmount != null) {
            paymentSummary.push(`Вход учтён: ${row.entryPaidAmount}`);
          }
          if (row.reentryPaidAmounts != null && row.reentryPaidAmounts.length > 0) {
            paymentSummary.push(`Ребаи: ${row.reentryPaidAmounts.join(", ")}`);
          }

          return (
            <div
              key={index}
              className={clsx(
                playerListRowCls,
                needsEntryHighlight && playerListRowHighlightCls,
                row.status === "Registered" && playerListRowMutedCls,
                row.signAgreement === false && playerListRowNoAgreementCls
              )}
            >
              <Typography.Text
                size="small"
                type="secondary"
                className={playerListRowNumberCls}
              >
                {row.tournamentPlayerId ?? row.playerId}
              </Typography.Text>
              <div className={playerListRowNameBlockCls}>
                <Typography.Text size="small">{row.playerName}</Typography.Text>
                {paymentSummary.length > 0 ? (
                  <Typography.Text size="xSmall" type="secondary">
                    {paymentSummary.join(" · ")}
                  </Typography.Text>
                ) : null}
              </div>
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

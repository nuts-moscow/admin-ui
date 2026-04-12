"use client";

import type { FC } from "react";
import { Formatter } from "@/components/Formatter/Formatter";
import { Typography } from "@/components/Typography/Typography";
import { usePublicTournamentRatingPointsDistribution } from "@/core/states/tournaments/hooks/usePublicTournamentRatingPointsDistribution";
import type { ChipPoolWindowLayout } from "./TournamentChipPoolWindow.css";
import {
  chipPoolRatingEllipsisCellCls,
  chipPoolRatingMetaCls,
  chipPoolRatingTableCls,
  chipPoolRatingTdCls,
  chipPoolRatingThCls,
  chipPoolRatingTitleCls,
  chipPoolRightColumnCls,
} from "./TournamentChipPoolWindow.css";
import { CHIP_POOL_INK_MUTED } from "./chipPoolTokens";

export interface PublicRatingPointsColumnProps {
  readonly tournamentId: string;
  readonly layout: ChipPoolWindowLayout;
}

export const PublicRatingPointsColumn: FC<PublicRatingPointsColumnProps> = ({
  tournamentId,
  layout,
}) => {
  const { data, loading, error } =
    usePublicTournamentRatingPointsDistribution(tournamentId);

  if (loading && data === undefined) {
    return (
      <div className={chipPoolRightColumnCls({ layout })}>
        <div className={chipPoolRatingTitleCls({ layout })}>
          Рейтинговая зона
        </div>
        <Typography.Text
          size="small"
          style={{ color: CHIP_POOL_INK_MUTED, textAlign: "right" }}
        >
          Загрузка…
        </Typography.Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className={chipPoolRightColumnCls({ layout })}>
        <div className={chipPoolRatingTitleCls({ layout })}>
          Рейтинговая зона
        </div>
        <Typography.Text
          type="error"
          size="small"
          style={{ textAlign: "right", display: "block" }}
        >
          {error.message}
        </Typography.Text>
      </div>
    );
  }

  if (
    !data ||
    data.playersInTournament === 0 ||
    data.places.length === 0
  ) {
    return (
      <div className={chipPoolRightColumnCls({ layout })}>
        <div className={chipPoolRatingTitleCls({ layout })}>
          Рейтинговая зона
        </div>
        <Typography.Text
          size="small"
          style={{
            color: CHIP_POOL_INK_MUTED,
            textAlign: "right",
            display: "block",
            maxWidth: "min(100%, 22rem)",
          }}
        >
          Баллы по местам появятся после формирования поля
        </Typography.Text>
      </div>
    );
  }

  return (
    <div className={chipPoolRightColumnCls({ layout })}>
      <div className={chipPoolRatingTitleCls({ layout })}>Рейтинговая зона</div>
      <table className={chipPoolRatingTableCls({ layout })}>
        <thead>
          <tr>
            <th
              className={chipPoolRatingThCls({ layout })}
              scope="col"
              style={{ textAlign: "right", paddingRight: 12 }}
            >
              Место
            </th>
            <th
              className={chipPoolRatingThCls({ layout })}
              scope="col"
              style={{ textAlign: "right" }}
            >
              Баллы
            </th>
          </tr>
        </thead>
        <tbody>
          {data.places.flatMap((row, i) => {
            const prev = i > 0 ? data.places[i - 1] : null;
            const showEllipsisAfterTop10 =
              prev !== null && prev.place === 10 && row.place > 10;
            const rowEl = (
              <tr key={`${row.place}-${row.fromTableAfterCoefficient}`}>
                <td
                  className={chipPoolRatingTdCls({ layout })}
                  style={{ textAlign: "right", paddingRight: 12 }}
                >
                  {row.place}
                </td>
                <td
                  className={chipPoolRatingTdCls({ layout })}
                  style={{ textAlign: "right" }}
                >
                  <Formatter.number
                    value={row.fromTableAfterCoefficient}
                    type="2digit"
                  />
                </td>
              </tr>
            );
            if (!showEllipsisAfterTop10) {
              return [rowEl];
            }
            return [
              <tr key={`ellipsis-after-10-${row.place}`}>
                <td colSpan={2} className={chipPoolRatingEllipsisCellCls}>
                  …
                </td>
              </tr>,
              rowEl,
            ];
          })}
        </tbody>
      </table>
      <div
        className={chipPoolRatingMetaCls({ layout })}
        style={{ textAlign: "right" }}
      >
        Игроков в поле: {data.playersInTournament}
        {typeof data.prizePlacesDepth === "number"
          ? ` · призовая зона: до ${data.prizePlacesDepth}-го места`
          : null}
      </div>
    </div>
  );
};

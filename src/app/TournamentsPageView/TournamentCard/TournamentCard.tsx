"use client";

import { FC } from "react";
import { Typography } from "@/components/Typography/Typography";
import { DateTimeFormatter } from "@/components/Formatter/DateTimeFormatter/DateTimeFormatter";
import { ShortTournament } from "@/core/states/tournaments/requests/getTournaments";
import { SimpleList } from "@/components/SimpleList/SimpleList";
import Link from "next/link";
import { nextLinkCls } from "@/core/utils/style/nextLink.css";

export interface TournamentCardProps {
  readonly tournament: ShortTournament;
  readonly onClick?: () => void;
}

export const TournamentCard: FC<TournamentCardProps> = ({
  tournament,
  onClick,
}) => {
  const { name, date } = tournament;
  const ratingLine: string[] = [];
  if (tournament.ratingGuaranteeEnabled === true) {
    ratingLine.push("Гарантия вкл.");
  } else if (tournament.ratingGuaranteeEnabled === false) {
    ratingLine.push("Гарантия выкл.");
  }
  if (tournament.ratingGuaranteeBonusPoints != null) {
    ratingLine.push(`бонус ${tournament.ratingGuaranteeBonusPoints}`);
  }
  const showRatingMeta = ratingLine.length > 0;

  return (
    <Link
      href={`/tournament/${tournament.id}`}
      className={nextLinkCls({ justify: true })}
    >
      <SimpleList.Card onClick={onClick}>
        <SimpleList.Column>
          <Typography.Text size="small" type="secondary">
            Дата
          </Typography.Text>
          <Typography.Text>
            <DateTimeFormatter value={date} type="date" />
          </Typography.Text>
        </SimpleList.Column>

        <SimpleList.Column>
          <Typography.Text size="small" type="secondary">
            Время
          </Typography.Text>
          <Typography.Text>
            <DateTimeFormatter value={date} type="time" />
          </Typography.Text>
        </SimpleList.Column>

        <SimpleList.Column>
          <Typography.Text size="small" type="secondary">
            Название турнира
          </Typography.Text>
          <Typography.Text>{name}</Typography.Text>
        </SimpleList.Column>

        {showRatingMeta ? (
          <SimpleList.Column>
            <Typography.Text size="small" type="secondary">
              Рейтинг
            </Typography.Text>
            <Typography.Text>{ratingLine.join(" · ")}</Typography.Text>
          </SimpleList.Column>
        ) : null}
      </SimpleList.Card>
    </Link>
  );
};

"use client";

import { FC } from "react";
import { Typography } from "@/components/Typography/Typography";
import { Player } from "@/core/states/players/common/Player";
import { SimpleList } from "@/components/SimpleList/SimpleList";

export interface PlayerCardProps {
  readonly player: Player;
  readonly onClick?: () => void;
}

export const PlayerCard: FC<PlayerCardProps> = ({ player, onClick }) => {
  return (
    <SimpleList.Card onClick={onClick}>
      <SimpleList.Column>
        <Typography.Text size="small" type="secondary">
          Никнейм
        </Typography.Text>
        <Typography.Text>{player.nickname}</Typography.Text>
      </SimpleList.Column>

      <SimpleList.Column>
        <Typography.Text size="small" type="secondary">
          Имя
        </Typography.Text>
        <Typography.Text size="small">{player.name || "–"}</Typography.Text>
      </SimpleList.Column>

      <SimpleList.Column>
        <Typography.Text size="small" type="secondary">
          Telegram
        </Typography.Text>
        <Typography.Text size="small">{player.tg || "–"}</Typography.Text>
      </SimpleList.Column>

      <SimpleList.Column>
        <Typography.Text size="small" type="secondary">
          Phone
        </Typography.Text>
        <Typography.Text size="small">{player.phone || "–"}</Typography.Text>
      </SimpleList.Column>
    </SimpleList.Card>
  );
};

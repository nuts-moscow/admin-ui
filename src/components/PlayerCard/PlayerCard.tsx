'use client';

import { FC } from 'react';
import { Box } from '@/components/Box/Box';
import { Typography } from '@/components/Typography/Typography';
import { playerCardCls, playerCardColumnCls } from '@/components/PlayerCard/PlayerCard.css';
import { clsx } from 'clsx';

export interface PlayerCardProps {
  readonly name: string;
  readonly phone?: string;
  readonly gamesPlayed: number;
  readonly onClick?: () => void;
}

export const PlayerCard: FC<PlayerCardProps> = ({
  name,
  phone,
  gamesPlayed,
  onClick,
}) => {
  return (
    <Box
      flex={{ gap: 16, align: 'center' }}
      padding={4}
      borderRadius="m"
      border
      className={playerCardCls}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={clsx(playerCardColumnCls, 'name-col')}>
        <Typography.Text size="small" type="secondary">
          Имя
        </Typography.Text>
        <Typography.Text>{name}</Typography.Text>
      </div>

      {phone && (
        <div className={clsx(playerCardColumnCls, 'phone-col')}>
          <Typography.Text size="small" type="secondary">
            Номер телефона
          </Typography.Text>
          <Typography.Text size="small">{phone}</Typography.Text>
        </div>
      )}

      <div className={clsx(playerCardColumnCls, 'games-col')}>
        <Typography.Text size="small" type="secondary">
          Игр сыграно
        </Typography.Text>
        <Typography.Text>{gamesPlayed}</Typography.Text>
      </div>
    </Box>
  );
};


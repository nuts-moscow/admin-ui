'use client';

import { FC } from 'react';
import { Box } from '@/components/Box/Box';
import { Typography } from '@/components/Typography/Typography';
import { structureCardCls, structureCardColumnCls } from '@/components/StructureCard/StructureCard.css';
import { clsx } from 'clsx';

export interface StructureCardProps {
  readonly name: string;
  readonly duration: string;
  readonly smallBlind: number;
  readonly bigBlind: number;
  readonly playersLimit: number;
  readonly onClick?: () => void;
}

export const StructureCard: FC<StructureCardProps> = ({
  name,
  duration,
  smallBlind,
  bigBlind,
  playersLimit,
  onClick,
}) => {
  return (
    <Box
      flex={{ gap: 16, align: 'center' }}
      padding={4}
      borderRadius="m"
      border
      className={structureCardCls}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className={clsx(structureCardColumnCls, 'name-col')}>
        <Typography.Text size="small" type="secondary">
          Название
        </Typography.Text>
        <Typography.Text>{name}</Typography.Text>
      </div>

      <div className={clsx(structureCardColumnCls, 'duration-col')}>
        <Typography.Text size="small" type="secondary">
          Время
        </Typography.Text>
        <Typography.Text>{duration}</Typography.Text>
      </div>

      <div className={clsx(structureCardColumnCls, 'blinds-col')}>
        <Typography.Text size="small" type="secondary">
          Старт
        </Typography.Text>
        <Typography.Text size="small">
          {smallBlind}/{bigBlind}
        </Typography.Text>
      </div>

      <div className={clsx(structureCardColumnCls, 'players-col')}>
        <Typography.Text size="small" type="secondary">
          Игроков
        </Typography.Text>
        <Typography.Text size="small">{playersLimit}</Typography.Text>
      </div>
    </Box>
  );
};


"use client";

import { FC } from "react";
import { Typography } from "@/components/Typography/Typography";
import { TournamentStructure } from "@/core/states/tournamentStructures/common/TournamentStructure";
import { Blind, BlindType } from "@/core/states/tournamentStructures/common/BlindType";
import { SimpleList } from "@/components/SimpleList/SimpleList";

function isBlind(item: BlindType): item is Blind {
  return item != null && "smallBlind" in item && "bigBlind" in item;
}

function getFirstBlindLevel(blindsStructure: TournamentStructure["blindsStructure"]): string {
  const first = blindsStructure?.find(isBlind);
  return first ? `${first.smallBlind}/${first.bigBlind}` : "–";
}

export interface StructureCardProps {
  readonly structure: TournamentStructure;
  readonly onClick?: () => void;
}

export const StructureCard: FC<StructureCardProps> = ({
  structure,
  onClick,
}) => {
  return (
    <SimpleList.Card onClick={onClick}>
      <SimpleList.Column>
        <Typography.Text size="small" type="secondary">
          Название
        </Typography.Text>
        <Typography.Text>{structure.name}</Typography.Text>
      </SimpleList.Column>

      <SimpleList.Column>
        <Typography.Text size="small" type="secondary">
          Старт
        </Typography.Text>
        <Typography.Text size="small">
          {getFirstBlindLevel(structure.blindsStructure)}
        </Typography.Text>
      </SimpleList.Column>

      <SimpleList.Column>
        <Typography.Text size="small" type="secondary">
          Игроков
        </Typography.Text>
        <Typography.Text size="small">{structure.playersLimit}</Typography.Text>
      </SimpleList.Column>
    </SimpleList.Card>
  );
};

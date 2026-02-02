"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Form } from "@/components/Form/Form";
import { FormModel } from "@/components/Form/FormModel";
import { SimpleList } from "@/components/SimpleList/SimpleList";
import { Typography } from "@/components/Typography/Typography";
import { useTournamentStructures } from "@/core/states/tournamentStructures/hooks/useTournamentStructures";
import { TournamentStructure } from "@/core/states/tournamentStructures/common/TournamentStructure";
import { List } from "@/components/List/List";
import { CreateTournamentForm } from "./CreateTournamentModal";

export const StructureStep: FC = () => {
  const { data: structures } = useTournamentStructures();

  return (
    <Form.Control name="structure">
      {({
        value,
        onChange,
        parent,
      }: {
        value: TournamentStructure | undefined;
        onChange: (value: TournamentStructure | undefined) => void;
        parent: FormModel<CreateTournamentForm>;
      }) => (
        <Box flex={{ col: true, gap: 2, width: "100%" }}>
          <List
            items={structures || []}
            itemKey="id"
            itemHeight={80}
            height={400}
            gap={2}
          >
            {({ item: structure }) => (
              <SimpleList.Card
                key={structure.id}
                selected={value?.id === structure.id}
                onClick={() => {
                  parent?.setValue({ name: structure.name });
                  onChange(structure);
                }}
              >
                <SimpleList.Column>
                  <Typography.Text bold>{structure.name}</Typography.Text>
                  <Typography.Text size="small" type="grey">
                    Игроков: {structure.playersLimit} • Стек:{" "}
                    {structure.stackSize} • Старт:{" "}
                    {structure.blindsStructure[0].smallBlind}/
                    {structure.blindsStructure[0].bigBlind} • Финал игры:{" "}
                    {structure.freezeOutEnabled ? "Да" : "Нет"}
                  </Typography.Text>
                </SimpleList.Column>
              </SimpleList.Card>
            )}
          </List>

          {(!structures || structures.length === 0) && (
            <SimpleList.EmptyState>
              Нет доступных структур
            </SimpleList.EmptyState>
          )}
        </Box>
      )}
    </Form.Control>
  );
};

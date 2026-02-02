"use client";

import { FC, useEffect } from "react";
import { Box } from "@/components/Box/Box";
import { Form } from "@/components/Form/Form";
import { Input } from "@/components/Input/Input";
import { Typography } from "@/components/Typography/Typography";
import { DateTime } from "luxon";
import { TournamentStructure } from "@/core/states/tournamentStructures/common/TournamentStructure";
import { BlindList } from "@/app/settings/SettingsPageView/components/StructuresView/CreateStructureModal/BlindList/BlindList";
import { CreateTournamentForm } from "./CreateTournamentModal";

export const InfoStep: FC = () => {
  return (
    <Box flex={{ col: true, gap: 4, width: "100%" }}>
      <Form.Control name="name">
        {({ value, onChange, parent }) => (
          <Input
            label="Имя турнира"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Введите имя"
          />
        )}
      </Form.Control>

      <Box flex={{ col: true, gap: 4 }}>
        <Form.Listener>
          {({ value }: { value: CreateTournamentForm }) => (
            <Box flex={{ align: "center", gap: 2 }}>
              <Typography.Text type="secondary">Дата и время:</Typography.Text>
              <Typography.Text>
                {DateTime.fromFormat(value.date, "yyyy-MM-dd").toFormat(
                  "dd.MM.yyyy"
                )}
                , {DateTime.fromFormat(value.time, "HH:mm").toFormat("HH:mm")}
              </Typography.Text>
            </Box>
          )}
        </Form.Listener>

        <Form.Listener name="structure">
          {({ value }: { value: TournamentStructure | undefined }) =>
            value ? (
              <>
                <Box flex={{ align: "center", gap: 2 }}>
                  <Typography.Text type="secondary">
                    Максимальное количество игроков:
                  </Typography.Text>
                  <Typography.Text>{value.playersLimit}</Typography.Text>
                </Box>
                <Box flex={{ align: "center", gap: 2 }}>
                  <Typography.Text type="secondary">
                    Стартовый стек:
                  </Typography.Text>
                  <Typography.Text>{value.stackSize}</Typography.Text>
                </Box>
                <Box flex={{ align: "center", gap: 2 }}>
                  <Typography.Text type="secondary">
                    Финал игры:
                  </Typography.Text>
                  <Typography.Text>
                    {value.freezeOutEnabled ? "Да" : "Нет"}
                  </Typography.Text>
                </Box>
                <Box flexItem={{ marginTop: 2 }} />
                <BlindList
                  value={value.blindsStructure}
                  onChange={() => {}}
                  readOnly={true}
                />
              </>
            ) : (
              <Typography.Text type="grey">
                Структура не выбрана
              </Typography.Text>
            )
          }
        </Form.Listener>
      </Box>
    </Box>
  );
};

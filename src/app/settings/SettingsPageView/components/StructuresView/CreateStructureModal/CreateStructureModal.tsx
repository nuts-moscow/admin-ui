"use client";

import { FC, useEffect, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Form } from "@/components/Form/Form";
import { useForm, toCtrlParam } from "@/components/Form/useForm";
import { Modal, WithModalProps } from "@/components/Modal/Modal";
import {
  Blinds,
  BlindType,
} from "@/core/states/tournamentStructures/common/BlindType";
import { BlindList } from "./BlindList/BlindList";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { Typography } from "@/components/Typography/Typography";
import {
  createTournamentStructure,
  CreateTournamentStructureRequest,
} from "@/core/states/tournamentStructures/requests/createTournamentStructure";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { refetchTournamentStructures } from "@/core/states/tournamentStructures/hooks/useTournamentStructures";
import { TournamentStructure } from "@/core/states/tournamentStructures/common/TournamentStructure";
import {
  updateTournamentStructure,
  UpdateTournamentStructureRequest,
} from "@/core/states/tournamentStructures/requests/updateTournamentStructure";

export interface CreateStructureModalProps extends WithModalProps {
  readonly structure?: TournamentStructure;
}

export const CreateStructureModal: FC<CreateStructureModalProps> = ({
  close,
  structure,
}) => {
  const environment = useEnvironment();
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [form] = useForm<Partial<CreateTournamentStructureRequest>>({
    controls: {
      name: toCtrlParam<string | undefined>(structure?.name, [
        {
          validate: (name) => (name ? undefined : "Required"),
          level: "error",
        },
      ]),
      stackSize: toCtrlParam<number | undefined>(structure?.stackSize, [
        {
          validate: (stackSize) => (stackSize ? undefined : "Required"),
          level: "error",
        },
      ]),
      playersLimit: toCtrlParam<number | undefined>(structure?.playersLimit, [
        {
          validate: (playersLimit) => (playersLimit ? undefined : "Required"),
          level: "error",
        },
      ]),
      freezeOutEnabled: structure?.freezeOutEnabled,
      blinds: toCtrlParam<Blinds | undefined>(structure?.blindsStructure, [
        {
          validate: (blinds) => (blinds?.length ? undefined : "Required"),
          level: "error",
        },
      ]),
    },
  });

  const handleSubmit = async () => {
    if (form.state === "error") {
      return;
    }
    setIsLoading(true);
    try {
      if (structure) {
        await updateTournamentStructure(environment, {
          ...(form.value as UpdateTournamentStructureRequest),
          id: structure.id,
        });
      } else {
        await createTournamentStructure(
          environment,
          form.value as CreateTournamentStructureRequest
        );
      }
      refetchTournamentStructures();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal.Title close={close}>Создать формат турнира</Modal.Title>
      <Modal.Content minWidth={720}>
        <Form model={form} flex={{ col: true, gap: 6 }} onSubmit={handleSubmit}>
          <Form.Control name="name">
            {({ value, onChange }) => (
              <Input
                rounded
                label="Название структуры"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </Form.Control>

          <Form.Control name="freezeOutEnabled">
            {({ value, onChange }) => (
              <Box flex={{ gap: 2, align: "center" }}>
                <Typography.Text size="small">Финал игры</Typography.Text>
                <Checkbox
                  size="small"
                  checked={value}
                  onCheckedChange={() => onChange(!value)}
                />
              </Box>
            )}
          </Form.Control>

          <Box flex={{ align: "center", gap: 4, width: "100%" }}>
            <Form.Control name="playersLimit">
              {({ value, onChange }) => (
                <Input.Number
                  rounded
                  flexItem={{ flex: 1 }}
                  placeholder="0"
                  label="Лимит игроков"
                  value={value}
                  onChange={(e) => onChange(Number(e.target.value))}
                />
              )}
            </Form.Control>
            <Form.Control name="stackSize">
              {({ value, onChange }) => (
                <Input.Number
                  rounded
                  flexItem={{ flex: 1 }}
                  label="Размер стека"
                  placeholder="0"
                  value={value}
                  onChange={(e) => onChange(Number(e.target.value))}
                />
              )}
            </Form.Control>
          </Box>

          <Form.Control name="blinds">
            {({ value, onChange }) => (
              <BlindList value={value} onChange={onChange} />
            )}
          </Form.Control>

          <Box flex={{ width: "100%", gap: 4 }}>
            <Button
              disabled={isLoading}
              type="secondary"
              onClick={close}
              flexItem={{ flex: 1 }}
              htmlType="button"
            >
              Отмена
            </Button>
            <Button
              disabled={form.state === "error"}
              type="primary"
              htmlType="submit"
              flexItem={{ flex: 1 }}
              loading={isLoading}
            >
              {structure ? "Обновить" : "Создать"}
            </Button>
          </Box>
        </Form>
      </Modal.Content>
    </>
  );
};

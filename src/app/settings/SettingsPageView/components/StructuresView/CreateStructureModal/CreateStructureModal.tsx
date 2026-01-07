"use client";

import { FC, useEffect, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Form } from "@/components/Form/Form";
import { useForm, toCtrlParam } from "@/components/Form/useForm";
import { Modal, WithModalProps } from "@/components/Modal/Modal";
import { MakeTournamentStructureRequest } from "@/core/states/tournaments/types";
import { BlindType } from "@/core/states/tournamentStructures/common/BlindType";
import { BlindList } from "./BlindList/BlindList";

export interface CreateStructureModalProps extends WithModalProps {
  readonly structureId?: number;
}

export const CreateStructureModal: FC<CreateStructureModalProps> = ({
  close,
  opened,
  structureId,
}) => {
  const [ready, setReady] = useState(false);
  const [form] = useForm<Partial<MakeTournamentStructureRequest>>({
    controls: {
      name: toCtrlParam<string | undefined>(undefined, [
        {
          validate: (name) => (name ? undefined : "Required"),
          level: "error",
        },
      ]),
      stackSize: toCtrlParam<number | undefined>(undefined, [
        {
          validate: (stackSize) => (stackSize ? undefined : "Required"),
          level: "error",
        },
      ]),
      playersLimit: toCtrlParam<number | undefined>(undefined, [
        {
          validate: (playersLimit) => (playersLimit ? undefined : "Required"),
          level: "error",
        },
      ]),
      freezeOutEnabled: false,
      blinds: toCtrlParam<BlindType[] | undefined>(undefined, [
        {
          validate: (blinds) => (blinds?.length ? undefined : "Required"),
          level: "error",
        },
      ]),
    },
  });

  const handleSubmit = () => {
    if (form.state === "error") {
      return;
    }
    console.log(form.value);
  };

  useEffect(() => {
    if (structureId) {
      /* get structure by id */
      setTimeout(() => {
        setReady(true);
      }, 1000);
    } else {
      setReady(true);
    }
  }, []);

  return (
    <>
      <Modal.Title close={close}>Создать формат турнира</Modal.Title>
      <Modal.Content minWidth={710}>
        {ready ? (
          <Form
            model={form}
            flex={{ col: true, gap: 6 }}
            onSubmit={handleSubmit}
          >
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

            <Box flex={{ align: "center", gap: 4, width: "100%" }}>
              <Form.Control name="playersLimit">
                {({ value, onChange }) => (
                  <Input.Number
                    rounded
                    flexItem={{ flex: 1 }}
                    placeholder="0"
                    label="Лимит игроков"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
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
                    onChange={(e) => onChange(e.target.value)}
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
                type="secondary"
                onClick={close}
                flexItem={{ flex: 1 }}
                htmlType="button"
              >
                Отмена
              </Button>
              <Button type="primary" htmlType="submit" flexItem={{ flex: 1 }}>
                Создать
              </Button>
            </Box>
            {form.value && <pre>{JSON.stringify(form.value, null, 2)}</pre>}
          </Form>
        ) : (
          <div>Loading...</div>
        )}
      </Modal.Content>
    </>
  );
};

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

const BLINDS_MIN_LEVEL_MESSAGE =
  "Нужен хотя бы один уровень блайндов";

function hasAtLeastOneBlindLevel(
  blinds: Blinds | BlindType[] | undefined,
): boolean {
  if (!blinds?.length) return false;
  return blinds.some(
    (item) =>
      item != null &&
      "smallBlind" in item &&
      "bigBlind" in item &&
      typeof (item as { smallBlind: unknown }).smallBlind === "number" &&
      typeof (item as { bigBlind: unknown }).bigBlind === "number",
  );
}
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
  const [form, formValue] = useForm<Partial<CreateTournamentStructureRequest>>({
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
      freezeOutEnabled: toCtrlParam<boolean | undefined>(
        structure?.freezeOutEnabled ?? false,
        [],
      ),
      entryFreeOnly: toCtrlParam<boolean | undefined>(
        structure?.entryFreeOnly ?? false,
        [],
      ),
      maxReentries: toCtrlParam<number | undefined>(structure?.maxReentries, [
        {
          validate: (v) => {
            if (v === undefined || v === null) return undefined;
            if (!Number.isFinite(v) || !Number.isInteger(v) || v < 0) {
              return "Целое число ≥ 0";
            }
            return undefined;
          },
          level: "error",
        },
      ]),
      blinds: toCtrlParam<Blinds | undefined>(structure?.blindsStructure, [
        {
          validate: (blinds) => {
            if (!blinds?.length) return BLINDS_MIN_LEVEL_MESSAGE;
            if (!hasAtLeastOneBlindLevel(blinds)) {
              return BLINDS_MIN_LEVEL_MESSAGE;
            }
            return undefined;
          },
          level: "error",
        },
      ]),
    },
  });

  const handleSubmit = async () => {
    if (form.state === "error") {
      return;
    }
    const blinds = form.value.blinds;
    if (!hasAtLeastOneBlindLevel(blinds)) {
      return;
    }
    setIsLoading(true);
    try {
      const freezeOutEnabled = form.value.freezeOutEnabled === true;
      const entryFreeOnly = form.value.entryFreeOnly === true;
      if (structure) {
        await updateTournamentStructure(environment, {
          ...(form.value as UpdateTournamentStructureRequest),
          id: structure.id,
          freezeOutEnabled,
          entryFreeOnly,
        });
      } else {
        await createTournamentStructure(environment, {
          ...(form.value as CreateTournamentStructureRequest),
          freezeOutEnabled,
          entryFreeOnly,
        });
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
                <Typography.Text size="small">Финал игры (freeze-out)</Typography.Text>
                <Checkbox
                  size="small"
                  checked={value ?? false}
                  onCheckedChange={() => onChange(!Boolean(value))}
                />
              </Box>
            )}
          </Form.Control>

          <Box
            flex={{ col: true, gap: 1 }}
            style={{
              opacity: formValue.freezeOutEnabled === true ? 0.55 : 1,
            }}
          >
            <Form.Control name="maxReentries">
              {({ value, onChange }) => (
                <Input.Number
                  rounded
                  decimalScale={0}
                  allowNegative={false}
                  label="Макс. реентри на игрока"
                  placeholder="Пусто — по умолчанию 5 на сервере"
                  value={value ?? ""}
                  onValueChange={(v) => {
                    if (v.value === "" || v.floatValue === undefined) {
                      onChange(undefined);
                    } else {
                      onChange(Math.trunc(v.floatValue));
                    }
                  }}
                />
              )}
            </Form.Control>
            {formValue.freezeOutEnabled === true ? (
              <Typography.Text type="secondary" size="xxSmall">
                В freeze-out реентри в игре отключены (эффективный лимит 0); значение
                можно оставить в шаблоне на будущее.
              </Typography.Text>
            ) : null}
          </Box>

          <Form.Control name="entryFreeOnly">
            {({ value, onChange }) => (
              <Box flex={{ col: true, gap: 1 }}>
                <Box flex={{ gap: 2, align: "center" }}>
                  <Typography.Text size="small">
                    Вход только бесплатно (первый бай-ин)
                  </Typography.Text>
                  <Checkbox
                    size="small"
                    checked={value ?? false}
                    onCheckedChange={() => onChange(!Boolean(value))}
                  />
                </Box>
                <Typography.Text type="secondary" size="xxSmall">
                  Реентри можно оплачивать как обычно (карта, наличные, Free).
                </Typography.Text>
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

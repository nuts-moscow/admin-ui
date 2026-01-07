"use client";

import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { TextArea } from "@/components/Textarea/TextArea";
import { Form } from "@/components/Form/Form";
import { useForm, toCtrlParam } from "@/components/Form/useForm";
import { Modal, WithModalProps } from "@/components/Modal/Modal";

import {
  createPlayer,
  CreatePlayerRequest,
} from "@/core/states/players/requests/createPlayer";
import {
  updatePlayer,
  UpdatePlayerRequest,
} from "@/core/states/players/requests/updatePlayer";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { refetchPlayers } from "@/core/states/players/hooks/usePlayers";
import { Player } from "@/core/states/players/common/Player";
import { Phone, User } from "lucide-react";

export interface CreatePlayerModalProps extends WithModalProps {
  readonly player?: Player;
}

export const CreatePlayerModal: FC<CreatePlayerModalProps> = ({
  close,
  player,
}) => {
  const environment = useEnvironment();

  const [isLoading, setIsLoading] = useState(false);
  const [form] = useForm<Partial<CreatePlayerRequest>>({
    controls: {
      nickname: toCtrlParam<string | undefined>(player?.nickname, [
        {
          validate: (nickname) => (nickname ? undefined : "Required"),
          level: "error",
        },
      ]),
      name: toCtrlParam<string | undefined>(player?.name, []),
      tg: toCtrlParam<string | undefined>(player?.tg, []),
      phone: toCtrlParam<string | undefined>(player?.phone, []),
      notes: toCtrlParam<string | undefined>(player?.notes, []),
    },
  });

  const handleSubmit = async () => {
    if (form.state === "error") {
      return;
    }
    setIsLoading(true);
    try {
      if (player) {
        await updatePlayer(environment, {
          id: player.id,
          ...(form.value as Partial<UpdatePlayerRequest>),
        } as UpdatePlayerRequest);
      } else {
        await createPlayer(environment, form.value as CreatePlayerRequest);
      }
      refetchPlayers();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal.Title close={close}>
        {player ? "Редактировать игрока" : "Создать игрока"}
      </Modal.Title>
      <Modal.Content minWidth={480}>
        <Form model={form} flex={{ col: true, gap: 6 }} onSubmit={handleSubmit}>
          <Form.Control name="nickname">
            {({ value, onChange }) => (
              <Input
                rounded
                label="Никнейм"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                leftAdornment={<User size={20} />}
              />
            )}
          </Form.Control>

          <Form.Control name="name">
            {({ value, onChange }) => (
              <Input
                rounded
                label="Имя"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </Form.Control>

          <Form.Control name="tg">
            {({ value, onChange }) => (
              <Input
                rounded
                label="Telegram"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </Form.Control>

          <Form.Control name="phone">
            {({ value, onChange }) => (
              <Input
                rounded
                label="Phone"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                leftAdornment={<Phone size={20} />}
              />
            )}
          </Form.Control>

          <Form.Control name="notes">
            {({ value, onChange }) => (
              <TextArea
                rounded
                label="Комментарий"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  onChange(e.target.value)
                }
              />
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
              {player ? "Обновить" : "Создать"}
            </Button>
          </Box>
        </Form>
      </Modal.Content>
    </>
  );
};

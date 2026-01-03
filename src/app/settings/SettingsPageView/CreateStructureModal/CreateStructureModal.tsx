'use client';

import { FC } from 'react';
import { Box } from '@/components/Box/Box';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Form } from '@/components/Form/Form';
import { useForm, toCtrlParam } from '@/components/Form/useForm';
import { Modal, WithModalProps } from '@/components/Modal/Modal';

interface CreateStructureFormData {
  readonly name: string;
  readonly duration: string;
  readonly smallBlind: number;
  readonly bigBlind: number;
  readonly playersLimit: number;
}

export const CreateStructureModalContent: FC<WithModalProps> = ({
  close,
  opened,
}) => {
  const [form, formValue] = useForm({
    controls: {
      name: toCtrlParam(''),
      duration: toCtrlParam(''),
      smallBlind: toCtrlParam(''),
      bigBlind: toCtrlParam(''),
      playersLimit: toCtrlParam(''),
    },
  });

  const isFormValid = form.valid;

  const handleSubmit = () => {
    if (isFormValid) {
      console.log('Form submitted:', formValue);
      close();
    }
  };

  return (
    <>
      <Modal.Title close={close}>Создать формат турнира</Modal.Title>
      <Modal.Content>
        <Form model={form} flex={{ col: true, gap: 16 }}>
          <Form.Control name="name">
            {({ value, onChange, state }) => (
              <Input
                label="Название структуры"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                error={state === 'invalid'}
                required
              />
            )}
          </Form.Control>

          <Form.Control name="duration">
            {({ value, onChange, state }) => (
              <Input
                label="Длительность уровня (минуты)"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                error={state === 'invalid'}
                placeholder="20 мин"
                required
              />
            )}
          </Form.Control>

          <Box flex={{ gap: 16 }}>
            <Form.Control name="smallBlind">
              {({ value, onChange, state }) => (
                <Input
                  label="Малый блайнд"
                  type="number"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  error={state === 'invalid'}
                  required
                  style={{ flex: 1 }}
                />
              )}
            </Form.Control>

            <Form.Control name="bigBlind">
              {({ value, onChange, state }) => (
                <Input
                  label="Большой блайнд"
                  type="number"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  error={state === 'invalid'}
                  required
                  style={{ flex: 1 }}
                />
              )}
            </Form.Control>
          </Box>

          <Form.Control name="playersLimit">
            {({ value, onChange, state }) => (
              <Input
                label="Лимит игроков"
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                error={state === 'invalid'}
                required
              />
            )}
          </Form.Control>

          <Box flex={{ gap: 8, justify: 'flex-end' }} style={{ marginTop: 16 }}>
            <Button type="outline" onClick={() => close()}>
              Отмена
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              Создать
            </Button>
          </Box>
        </Form>
      </Modal.Content>
    </>
  );
};


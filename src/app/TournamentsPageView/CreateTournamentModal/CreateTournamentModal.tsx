'use client';

import { FC } from 'react';
import { Box } from '@/components/Box/Box';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Form } from '@/components/Form/Form';
import { useForm, toCtrlParam } from '@/components/Form/useForm';
import { Modal, WithModalProps } from '@/components/Modal/Modal';
import { Typography } from '@/components/Typography/Typography';

interface CreateTournamentFormData {
  readonly name: string;
  readonly date: string;
  readonly time: string;
  readonly structureId: string;
}

const STRUCTURES = [
  { id: '1', name: 'Стандартный' },
  { id: '2', name: 'Супер-турбо' },
  { id: '3', name: '6-Max' },
  { id: '4', name: 'Турбо' },
  { id: '5', name: 'Deep Stack' },
];

export const CreateTournamentModalContent: FC<WithModalProps> = ({
  close,
  opened,
}) => {
  const [form, formValue] = useForm({
    controls: {
      name: toCtrlParam(''),
      date: toCtrlParam(''),
      time: toCtrlParam(''),
      structureId: toCtrlParam(''),
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
      <Modal.Title close={close}>Создать турнир</Modal.Title>
      <Modal.Content>
        <Form model={form} flex={{ col: true, gap: 16 }}>
          <Form.Control name="name">
            {({ value, onChange, state }) => (
              <Input
                label="Название турнира"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                error={state === 'invalid'}
                required
              />
            )}
          </Form.Control>

          <Form.Control name="date">
            {({ value, onChange, state }) => (
              <Input
                label="Дата"
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                error={state === 'invalid'}
                required
              />
            )}
          </Form.Control>

          <Form.Control name="time">
            {({ value, onChange, state }) => (
              <Input
                label="Время"
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                error={state === 'invalid'}
                required
              />
            )}
          </Form.Control>

          <Form.Control name="structureId">
            {({ value, onChange, state }) => (
              <Box flex={{ col: true, gap: 4, width: '100%' }}>
                <label
                  style={{
                    fontSize: 'var(--font-size-small)',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  Структура турнира
                </label>
                <select
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="">Выберите структуру</option>
                  {STRUCTURES.map((structure) => (
                    <option key={structure.id} value={structure.id}>
                      {structure.name}
                    </option>
                  ))}
                </select>
                {state === 'invalid' && (
                  <Typography.Text size="small" type="error">
                    Выберите структуру
                  </Typography.Text>
                )}
              </Box>
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


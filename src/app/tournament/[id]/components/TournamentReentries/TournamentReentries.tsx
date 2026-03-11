"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Modal, WithModalProps, useModal } from "@/components/Modal/Modal";
import { Typography } from "@/components/Typography/Typography";
import { TournamentInfoResponse } from "@/core/states/tournaments/requests/getTournament";
import { useNonRegisteredTournamentPlayerState } from "@/core/states/tournaments/hooks/useNonRegisteredTournamentPlayerState";
import {
  InGamePlayerState,
  PaymentMethod,
} from "@/core/states/tournaments/common/InGamePlayerState";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { addReentry } from "@/core/states/tournaments/requests/addReentry";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { addReentryPayment } from "@/core/states/tournaments/requests/addReentryPayment";

export interface TournamentReentriesProps {
  readonly tournament: TournamentInfoResponse;
}

interface AddReentryModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
}

interface PayReentriesModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
}

const PAY_REENTRY_METHOD_OPTIONS: Array<{
  readonly label: Exclude<PaymentMethod, "Free">;
  readonly value: Exclude<PaymentMethod, "Free">;
}> = [
  { label: "Cache", value: "Cache" },
  { label: "CreditCard", value: "CreditCard" },
];

const AddReentryModal: FC<AddReentryModalProps> = ({
  close,
  tournamentId,
  player,
}) => {
  const environment = useEnvironment();
  const [count, setCount] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCount(1);
  }, [player?.playerId]);

  const handleSave = async () => {
    if (!player || count <= 0 || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await addReentry(environment, {
        tournamentId: Number(tournamentId),
        playerId: player.playerId,
        count,
      });
      refetchTournamentPlayerState();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Добавить ребай</Modal.Title>
      <Modal.Content minWidth={420}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            {player
              ? `Игрок: ${player.playerName}`
              : "Укажи количество ребаев для игрока"}
          </Typography.Text>
          <input
            type="number"
            min={1}
            value={count}
            onChange={(event) =>
              setCount(Math.max(1, Number(event.target.value || 1)))
            }
            style={{
              width: "100%",
              borderRadius: 12,
              border: "1px solid var(--border-color)",
              minHeight: 44,
              padding: "0 12px",
              backgroundColor: "var(--background-primary)",
              color: "var(--text-primary)",
            }}
          />
          <Box flex={{ gap: 4, width: "100%" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={() => close()}
              flexItem={{ flex: 1 }}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="button"
              onClick={handleSave}
              flexItem={{ flex: 1 }}
              loading={isSaving}
              disabled={!player || count <= 0}
            >
              Сохранить
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};

const PayReentriesModal: FC<PayReentriesModalProps> = ({
  close,
  tournamentId,
  player,
}) => {
  const environment = useEnvironment();
  const [isSaving, setIsSaving] = useState(false);
  const [methods, setMethods] = useState<Array<Exclude<PaymentMethod, "Free">>>(
    [],
  );

  const paidReentryCount = useMemo(
    () =>
      (player?.reentryByPaymentMethod ?? []).reduce(
        (sum, [, count]) => sum + count,
        0,
      ),
    [player?.reentryByPaymentMethod],
  );
  const toPayReentryCount = useMemo(
    () => Math.max(0, (player?.unpaidReentryCount ?? 0) - paidReentryCount),
    [player?.unpaidReentryCount, paidReentryCount],
  );

  useEffect(() => {
    setMethods(Array.from({ length: toPayReentryCount }, () => "Cache"));
  }, [player?.playerId, toPayReentryCount]);

  const handleMethodChange = (
    index: number,
    value: Exclude<PaymentMethod, "Free">,
  ) => {
    setMethods((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleSave = async () => {
    if (!player || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await addReentryPayment(environment, {
        tournamentId: Number(tournamentId),
        playerId: player.playerId,
        payments: methods,
      });
      refetchTournamentPlayerState();
      close();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal.Title showCloseButton>Оплатить ребаи</Modal.Title>
      <Modal.Content minWidth={520}>
        <Box flex={{ col: true, gap: 4 }}>
          <Typography.Text type="secondary" size="small">
            {player
              ? `Игрок: ${player.playerName}. Неоплачено ребаев: ${toPayReentryCount}`
              : "Выбери способы оплаты"}
          </Typography.Text>
          <Box flex={{ col: true, gap: 2 }}>
            {methods.map((method, index) => (
              <Box key={index} flex={{ align: "center", gap: 2 }}>
                <Typography.Text
                  size="small"
                  type="secondary"
                  flexItem={{ minWidth: 70 }}
                >
                  Ребай {index + 1}
                </Typography.Text>
                <select
                  value={method}
                  onChange={(event) =>
                    handleMethodChange(
                      index,
                      event.target.value as Exclude<PaymentMethod, "Free">,
                    )
                  }
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid var(--border-color)",
                    minHeight: 40,
                    padding: "0 12px",
                    backgroundColor: "var(--background-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  {PAY_REENTRY_METHOD_OPTIONS.map((methodOption) => (
                    <option key={methodOption.value} value={methodOption.value}>
                      {methodOption.label}
                    </option>
                  ))}
                </select>
              </Box>
            ))}
          </Box>
          <Box flex={{ gap: 4, width: "100%" }}>
            <Button
              type="secondary"
              htmlType="button"
              onClick={() => close()}
              flexItem={{ flex: 1 }}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="button"
              onClick={handleSave}
              flexItem={{ flex: 1 }}
              loading={isSaving}
              disabled={!player || toPayReentryCount <= 0}
            >
              Сохранить
            </Button>
          </Box>
        </Box>
      </Modal.Content>
    </>
  );
};

export const TournamentReentries: FC<TournamentReentriesProps> = ({
  tournament,
}) => {
  const REENTRY_LIMIT = 5;
  const ACTIONS_COLUMN_WIDTH = 230;
  const [playerToAddReentry, setPlayerToAddReentry] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [playerToPayReentries, setPlayerToPayReentries] = useState<
    InGamePlayerState | undefined
  >(undefined);
  const [AddReentryModalConnect, openAddReentryModal] =
    useModal(AddReentryModal);
  const [PayReentriesModalConnect, openPayReentriesModal] =
    useModal(PayReentriesModal);
  const { data: players } = useNonRegisteredTournamentPlayerState(
    String(tournament.id),
  );
  const rows = useMemo(
    () =>
      [...(players ?? [])].sort((a, b) => {
        const aPaid = (a.reentryByPaymentMethod ?? []).reduce(
          (sum, [, count]) => sum + count,
          0,
        );
        const bPaid = (b.reentryByPaymentMethod ?? []).reduce(
          (sum, [, count]) => sum + count,
          0,
        );
        const aToPay = Math.max(0, a.unpaidReentryCount - aPaid);
        const bToPay = Math.max(0, b.unpaidReentryCount - bPaid);

        if (aToPay > 0 && bToPay === 0) {
          return -1;
        }
        if (aToPay === 0 && bToPay > 0) {
          return 1;
        }
        return a.playerId - b.playerId;
      }),
    [players],
  );

  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <AddReentryModalConnect
        tournamentId={String(tournament.id)}
        player={playerToAddReentry}
      />
      <PayReentriesModalConnect
        tournamentId={String(tournament.id)}
        player={playerToPayReentries}
      />
      <Box
        flex={{ width: "100%", align: "center", justify: "space-between" }}
        style={{
          borderBottom: "1px solid rgba(0, 0, 0, 0.16)",
          paddingBottom: 8,
        }}
      >
        <Typography.Text bold>Статистика ребаев</Typography.Text>
        <Typography.Text bold>{rows.length}</Typography.Text>
      </Box>

      <Box flex={{ col: true, gap: 2, width: "100%" }}>
        <Box
          flex={{ width: "100%", align: "center", gap: 3 }}
          style={{ padding: "0 12px", opacity: 0.65 }}
        >
          <Typography.Text size="small" flexItem={{ minWidth: 48 }}>
            id
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ flex: 1 }}>
            Никнейм
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ minWidth: 110 }}>
            Всего входов
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ minWidth: 96 }}>
            Бесплатно
          </Typography.Text>
          <Typography.Text size="small" flexItem={{ minWidth: 96 }}>
            К оплате
          </Typography.Text>
          <Typography.Text
            size="small"
            flexItem={{ minWidth: ACTIONS_COLUMN_WIDTH }}
            style={{
              width: ACTIONS_COLUMN_WIDTH,
              minWidth: ACTIONS_COLUMN_WIDTH,
              maxWidth: ACTIONS_COLUMN_WIDTH,
              flexShrink: 0,
            }}
          >
            Действие
          </Typography.Text>
        </Box>

        {rows.map((player) => {
          const freeReentryCount = player.freeReentryCount;
          const unpaidReentryCount = player.unpaidReentryCount;
          const paidReentryCount = (player.reentryByPaymentMethod ?? []).reduce(
            (sum, [, count]) => sum + count,
            0,
          );
          const toPayReentryCount = Math.max(
            0,
            unpaidReentryCount - paidReentryCount,
          );
          const totalReentryCount =
            freeReentryCount + unpaidReentryCount + paidReentryCount;

          return (
            <Box
              key={player.playerId}
              flex={{ width: "100%", align: "center", gap: 3 }}
              style={{
                backgroundColor:
                  toPayReentryCount > 0 ? "rgba(220, 38, 38, 0.12)" : "#e9e9e9",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <Typography.Text bold flexItem={{ minWidth: 48 }}>
                {player.playerId}
              </Typography.Text>
              <Typography.Text bold flexItem={{ flex: 1 }}>
                {player.playerName}
              </Typography.Text>
              <Typography.Text bold flexItem={{ minWidth: 110 }}>
                {totalReentryCount}/{REENTRY_LIMIT}
              </Typography.Text>
              <Typography.Text bold flexItem={{ minWidth: 96 }}>
                {freeReentryCount}/{REENTRY_LIMIT}
              </Typography.Text>
              <Typography.Text bold flexItem={{ minWidth: 96 }}>
                {toPayReentryCount}/{REENTRY_LIMIT}
              </Typography.Text>
              <Box
                flexItem={{ minWidth: ACTIONS_COLUMN_WIDTH }}
                style={{
                  width: ACTIONS_COLUMN_WIDTH,
                  minWidth: ACTIONS_COLUMN_WIDTH,
                  maxWidth: ACTIONS_COLUMN_WIDTH,
                  flexShrink: 0,
                }}
              >
                <Box flex={{ gap: 2 }}>
                  {toPayReentryCount > 0 && (
                    <Button
                      type="warning"
                      size="xxSmall"
                      onClick={() => {
                        setPlayerToPayReentries(player);
                        openPayReentriesModal();
                      }}
                    >
                      Оплатить
                    </Button>
                  )}
                  <Button
                    type="secondary"
                    size="xxSmall"
                    onClick={() => {
                      setPlayerToAddReentry(player);
                      openAddReentryModal();
                    }}
                  >
                    Добавить ребай
                  </Button>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

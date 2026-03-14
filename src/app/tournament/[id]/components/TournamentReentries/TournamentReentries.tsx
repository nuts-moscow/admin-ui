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
import { getPaymentMethodLabel } from "@/core/states/tournaments/common/paymentMethodLabels";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { refetchTournamentPlayerState } from "@/core/states/tournaments/hooks/useTournamentPlayerState";
import { addReentryPayment } from "@/core/states/tournaments/requests/addReentryPayment";
import { bountyEliminate } from "@/core/states/tournaments/requests/bountyEliminate";
import {
  refetchTournamentRebuyCount,
  useTournamentRebuyCount,
} from "@/core/states/tournaments/hooks/useTournamentRebuyCount";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/SearchableSelect/SearchableSelect";

export interface TournamentReentriesProps {
  readonly tournament: TournamentInfoResponse;
}

const toSafeNumber = (value: unknown): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

const getPlayerLabel = (player?: InGamePlayerState): string => {
  if (!player) {
    return "-";
  }
  return player.playerName || player.playerId || "-";
};

interface AddReentryModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
  readonly players: InGamePlayerState[];
}

interface PayReentriesModalProps extends WithModalProps {
  readonly tournamentId: string;
  readonly player?: InGamePlayerState;
}

const PAY_REENTRY_METHOD_OPTIONS: Array<{
  readonly label: Exclude<PaymentMethod, "Free">;
  readonly value: Exclude<PaymentMethod, "Free">;
}> = [
  { label: "CreditCard", value: "CreditCard" },
  { label: "Cache", value: "Cache" },
];

const AddReentryModal: FC<AddReentryModalProps> = ({
  close,
  tournamentId,
  player,
  players,
}) => {
  const environment = useEnvironment();
  const [count, setCount] = useState<number>(1);
  const [killerPlayerId, setKillerPlayerId] = useState<string | undefined>(
    undefined,
  );
  const [isSaving, setIsSaving] = useState(false);
  const killerCandidates = useMemo(
    () =>
      (players ?? []).filter(
        (candidate) =>
          candidate.playerId !== player?.playerId &&
          candidate.tableId != null &&
          candidate.tableId === player?.tableId,
      ),
    [player?.playerId, player?.tableId, players],
  );
  const killerOptions = useMemo<SearchableSelectOption[]>(
    () =>
      killerCandidates.map((candidate) => ({
        value: candidate.playerId,
        label: `${candidate.playerName} (ID: ${candidate.playerId})`,
      })),
    [killerCandidates],
  );

  useEffect(() => {
    setCount(1);
    setKillerPlayerId(killerCandidates[0]?.playerId);
  }, [player?.playerId, killerCandidates]);

  useEffect(() => {
    if (
      killerPlayerId &&
      !killerCandidates.some((candidate) => candidate.playerId === killerPlayerId)
    ) {
      setKillerPlayerId(killerCandidates[0]?.playerId);
    }
  }, [killerCandidates, killerPlayerId]);

  const handleSave = async () => {
    if (!player || count <= 0 || isSaving || !killerPlayerId) {
      return;
    }
    setIsSaving(true);
    try {
      for (let i = 0; i < count; i += 1) {
        await bountyEliminate(environment, Number(tournamentId), {
          eliminatedPlayerId: player.playerId,
          killerPlayerId,
          type: "Rebuy",
        });
      }
      refetchTournamentPlayerState();
      refetchTournamentRebuyCount();
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
              ? `Игрок: ${getPlayerLabel(player)}`
              : "Укажи количество ребаев для игрока"}
          </Typography.Text>
          <SearchableSelect
            options={killerOptions}
            value={killerPlayerId}
            placeholder={
              killerCandidates.length > 0
                ? "Кто выбил игрока?"
                : "Нет игроков за этим столом"
            }
            disabled={killerCandidates.length === 0 || isSaving}
            onChange={(value) => setKillerPlayerId(value)}
          />
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
              disabled={
                !player ||
                count <= 0 ||
                !killerPlayerId
              }
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
    () => (player?.reentryByPaymentMethod ?? []).length,
    [player?.reentryByPaymentMethod],
  );
  const toPayReentryCount = useMemo(
    () => Math.max(0, toSafeNumber(player?.unpaidReentryCount) - paidReentryCount),
    [player?.unpaidReentryCount, paidReentryCount],
  );

  useEffect(() => {
    setMethods(Array.from({ length: toPayReentryCount }, () => "CreditCard"));
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
      await addReentryPayment(
        environment,
        Number(tournamentId),
        player.playerId,
        {
        payments: methods,
        }
      );
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
              ? `Игрок: ${getPlayerLabel(player)}. Неоплачено ребаев: ${toPayReentryCount}`
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
                      {getPaymentMethodLabel(methodOption.label)}
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
  const [searchQuery, setSearchQuery] = useState("");
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
  const { data: rebuyCountResponse } = useTournamentRebuyCount(
    String(tournament.id)
  );
  const filteredPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return players ?? [];
    }
    return (players ?? []).filter((player) => {
      const label = getPlayerLabel(player).toLowerCase();
      return (
        label.includes(normalizedQuery) ||
        player.playerId.toLowerCase().includes(normalizedQuery) ||
        String(player.tournamentPlayerId)
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [players, searchQuery]);

  const rows = useMemo(
    () =>
      [...filteredPlayers].sort((a, b) => {
        const aUnpaid = toSafeNumber(a.unpaidReentryCount);
        const bUnpaid = toSafeNumber(b.unpaidReentryCount);
        const aHasUnpaid = aUnpaid > 0;
        const bHasUnpaid = bUnpaid > 0;

        if (aHasUnpaid && !bHasUnpaid) return -1;
        if (!aHasUnpaid && bHasUnpaid) return 1;

        const aTournamentPlayerId = Number(a.tournamentPlayerId);
        const bTournamentPlayerId = Number(b.tournamentPlayerId);
        if (
          Number.isFinite(aTournamentPlayerId) &&
          Number.isFinite(bTournamentPlayerId)
        ) {
          return aTournamentPlayerId - bTournamentPlayerId;
        }
        return (a.tournamentPlayerId ?? "").localeCompare(b.tournamentPlayerId ?? "");
      }),
    [filteredPlayers],
  );

  return (
    <Box flex={{ col: true, gap: 8, width: "100%" }}>
      <AddReentryModalConnect
        tournamentId={String(tournament.id)}
        player={playerToAddReentry}
        players={players ?? []}
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
        <Typography.Text bold>
          {rebuyCountResponse?.rebuyCount ?? rows.length}
        </Typography.Text>
      </Box>
      <input
        type="text"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Поиск игрока: id, никнейм"
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
          const freeReentryCount = toSafeNumber(player.freeReentryCount);
          const unpaidReentryCount = toSafeNumber(player.unpaidReentryCount);
          const paidReentryCount = (player.reentryByPaymentMethod ?? []).length;
          const toPayReentryCount = Math.max(
            0,
            unpaidReentryCount - paidReentryCount,
          );
          const totalReentryCount =
            freeReentryCount + unpaidReentryCount + paidReentryCount;
          const hasUnpaidReentry = unpaidReentryCount > 0;
          const rowBackgroundColor =
            hasUnpaidReentry
              ? "rgba(220, 38, 38, 0.12)"
              : "#e9e9e9";

          return (
            <Box
              key={player.playerId}
              flex={{ width: "100%", align: "center", gap: 3 }}
              style={{
                backgroundColor: rowBackgroundColor,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <Typography.Text bold flexItem={{ minWidth: 48 }}>
                {player.tournamentPlayerId}
              </Typography.Text>
              <Typography.Text bold flexItem={{ flex: 1 }}>
                {getPlayerLabel(player)}
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

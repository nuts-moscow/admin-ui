"use client";

import { FC, useEffect, useRef, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import {
  getTournament,
  TournamentInfoResponse,
} from "@/core/states/tournaments/requests/getTournament";
import { BlindList } from "@/app/settings/SettingsPageView/components/StructuresView/CreateStructureModal/BlindList/BlindList";
import { Blinds } from "@/core/states/tournamentStructures/common/BlindType";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { refetchTournament } from "@/core/states/tournaments/hooks/useTournament";
import { updateStructure } from "@/core/states/tournaments/requests/updateTournament";
import { useRatingTables } from "@/core/states/tournaments/hooks/useRatingTables";
import { patchTournamentRatingSettings } from "@/core/states/tournaments/requests/patchTournamentRatingSettings";
import { toast } from "@/components/Toast/Toast";
import { getRatingTableDisplayName } from "@/core/states/tournaments/common/ratingTableDisplayName";
import { formatSeasonLong } from "@/core/states/tournaments/common/seasonFormatting";

export interface TournamentInfoFormProps {
  readonly tournament: TournamentInfoResponse;
}

export const TournamentInfoForm: FC<TournamentInfoFormProps> = ({ tournament }) => {
  const environment = useEnvironment();
  const { data: ratingTables = [], loading: ratingTablesLoading } =
    useRatingTables();
  const [blinds, setBlinds] = useState<Blinds | undefined>(
    tournament.structure?.blindsStructure
  );
  const [isSaving, setIsSaving] = useState(false);
  const [ratingTableId, setRatingTableId] = useState(
    () => tournament.ratingTableId ?? 1,
  );
  const [ratingTableSaving, setRatingTableSaving] = useState(false);
  const ratingTableHydratedRef = useRef(false);

  /** Только при смене турнира — не подмешивать refetch, иначе старый GET затирает выбор. */
  useEffect(() => {
    setRatingTableId(tournament.ratingTableId ?? 1);
  }, [tournament.id]);

  useEffect(() => {
    ratingTableHydratedRef.current = false;
  }, [tournament.id]);

  /** Один раз подтянуть ratingTableId, когда поле впервые пришло с API (без повторных перезаписей при refetch). */
  useEffect(() => {
    if (
      !ratingTableHydratedRef.current &&
      tournament.ratingTableId != null &&
      Number.isFinite(tournament.ratingTableId)
    ) {
      ratingTableHydratedRef.current = true;
      setRatingTableId(Math.trunc(tournament.ratingTableId));
    }
  }, [tournament.ratingTableId]);

  const handleRatingTableChange = async (nextId: number, fromId: number) => {
    if (nextId === fromId) {
      return;
    }
    setRatingTableSaving(true);
    try {
      await patchTournamentRatingSettings(environment, tournament, {
        ratingTableId: nextId,
      });
      /** Сразу читаем турнир: кэш refetch может отдать старый снимок без ratingTableId. */
      const fresh = await getTournament(environment, String(tournament.id));
      if (fresh?.ratingTableId != null && Number.isFinite(fresh.ratingTableId)) {
        setRatingTableId(Math.trunc(fresh.ratingTableId));
      } else {
        setRatingTableId(nextId);
      }
      refetchTournament();
      toast({ type: "success", message: "Таблица рейтинга обновлена" });
    } catch (error) {
      setRatingTableId(fromId);
      toast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Не удалось сохранить таблицу",
      });
    } finally {
      setRatingTableSaving(false);
    }
  };

  const handleSave = async () => {
    if (!tournament.structure || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await updateStructure(
        environment,
        {
          id: tournament.id,
          name: tournament.name,
          date: tournament.date,
          status: tournament.status,
          structure: {
            name: tournament.structure.name,
            playersLimit: tournament.structure.playersLimit,
            stackSize: tournament.structure.stackSize,
            freezeOutEnabled: tournament.structure.freezeOutEnabled,
            entryFreeOnly: tournament.structure.entryFreeOnly === true,
            ...(tournament.structure.maxReentries != null &&
            Number.isFinite(tournament.structure.maxReentries)
              ? { maxReentries: tournament.structure.maxReentries }
              : {}),
            blindsStructure: tournament.structure.blindsStructure,
          },
        },
        blinds
      );
      refetchTournament();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box flex={{ col: true, align: "center", gap: 4, width: "100%" }}>
      <Box
        flex={{ col: true, gap: 4, width: "100%" }}
        style={{
          maxWidth: 760,
          borderRadius: 16,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          backgroundColor: "#fff",
          padding: "20px 24px",
        }}
      >
        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text type="secondary">Имя турнира:</Typography.Text>
          <Typography.Text>{tournament.name}</Typography.Text>
        </Box>

        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text type="secondary">
            Максимальное количество игроков:
          </Typography.Text>
          <Typography.Text>{tournament.structure?.playersLimit ?? "-"}</Typography.Text>
        </Box>

        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text type="secondary">Стартовый стек:</Typography.Text>
          <Typography.Text>{tournament.structure?.stackSize ?? "-"}</Typography.Text>
        </Box>

        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text type="secondary">Финал игры:</Typography.Text>
          <Typography.Text>
            {tournament.structure?.freezeOutEnabled ? "Да" : "Нет"}
          </Typography.Text>
        </Box>

        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text type="secondary">
            Вход только Free:
          </Typography.Text>
          <Typography.Text>
            {tournament.structure?.entryFreeOnly === true ? "Да" : "Нет"}
          </Typography.Text>
        </Box>

        <Box flex={{ align: "center", gap: 2 }}>
          <Typography.Text type="secondary">
            Макс. реентри (в шаблоне):
          </Typography.Text>
          <Typography.Text>
            {tournament.structure?.freezeOutEnabled
              ? "— (freeze-out)"
              : tournament.structure?.maxReentries != null
                ? tournament.structure.maxReentries
                : "по ум. 5"}
          </Typography.Text>
        </Box>

        <Box
          flex={{ col: true, gap: 1 }}
          style={{
            marginTop: 8,
            paddingTop: 12,
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Typography.Text bold size="small">
            Рейтинг
          </Typography.Text>
          <Box flex={{ col: true, gap: 1, align: "flex-start" }}>
            <Box flex={{ align: "center", gap: 2, flexWrap: "wrap" }}>
              <Typography.Text type="secondary" size="small">
                Учёт в рейтинге:
              </Typography.Text>
              <Typography.Text size="small">
                {tournament.ratingEnabled === false
                  ? "выкл. (спецформат)"
                  : tournament.ratingEnabled === true
                    ? "вкл."
                    : "—"}
              </Typography.Text>
            </Box>
            {tournament.ratingEnabled !== false ? (
              <Box flex={{ align: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography.Text type="secondary" size="small">
                  Сезон:
                </Typography.Text>
                <Typography.Text size="small">
                  {tournament.ratingSeasonYear != null &&
                  tournament.ratingSeasonMonth != null
                    ? formatSeasonLong(
                        tournament.ratingSeasonYear,
                        tournament.ratingSeasonMonth,
                      )
                    : "не задан"}
                </Typography.Text>
              </Box>
            ) : (
              <Typography.Text size="xSmall" type="secondary">
                Сезон не применяется
              </Typography.Text>
            )}
            <Typography.Text type="secondary" size="small">
              Таблица рейтинга
            </Typography.Text>
            <select
              value={ratingTableId}
              onChange={(e) => {
                const v = Number(e.target.value);
                const from = ratingTableId;
                setRatingTableId(v);
                void handleRatingTableChange(v, from);
              }}
              disabled={ratingTablesLoading || ratingTableSaving}
              style={{
                maxWidth: 360,
                width: "100%",
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.12)",
                backgroundColor: "#fff",
                fontSize: 14,
              }}
            >
              {ratingTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {getRatingTableDisplayName(t)}
                </option>
              ))}
            </select>
            {ratingTablesLoading ? (
              <Typography.Text type="secondary" size="xSmall">
                Загрузка списка…
              </Typography.Text>
            ) : null}
          </Box>
          <Box flex={{ align: "center", gap: 2, flexWrap: "wrap" }}>
            <Typography.Text type="secondary" size="small">
              Гарантия топ‑10:
            </Typography.Text>
            <Typography.Text size="small">
              {tournament.ratingGuaranteeEnabled === true
                ? "вкл."
                : tournament.ratingGuaranteeEnabled === false
                  ? "выкл."
                  : "—"}
            </Typography.Text>
            <Typography.Text type="secondary" size="small">
              · бонус (места 1–10):
            </Typography.Text>
            <Typography.Text size="small">
              {tournament.ratingGuaranteeBonusPoints != null
                ? tournament.ratingGuaranteeBonusPoints
                : "10 (по ум. на сервере)"}
            </Typography.Text>
          </Box>
          <Typography.Text type="secondary" size="xSmall">
            Изменить — вкладка «Рейтинг».
          </Typography.Text>
        </Box>

        <BlindList value={blinds} onChange={setBlinds} />
      </Box>
      <Button
        type="success"
        size="medium"
        onClick={handleSave}
        loading={isSaving}
        disabled={!tournament.structure}
      >
        Сохранить
      </Button>
    </Box>
  );
};

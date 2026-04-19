"use client";

import { FC } from "react";
import { Box } from "@/components/Box/Box";
import { Form } from "@/components/Form/Form";
import { Input } from "@/components/Input/Input";
import { Typography } from "@/components/Typography/Typography";
import { DateTime } from "luxon";
import { TournamentStructure } from "@/core/states/tournamentStructures/common/TournamentStructure";
import { BlindList } from "@/app/settings/SettingsPageView/components/StructuresView/CreateStructureModal/BlindList/BlindList";
import {
  CreateTournamentForm,
} from "./CreateTournamentModal";
import { useRatingTables } from "@/core/states/tournaments/hooks/useRatingTables";
import { getRatingTableDisplayName } from "@/core/states/tournaments/common/ratingTableDisplayName";
import { seasonSelectMonthOptions } from "@/core/states/tournaments/common/seasonFormatting";

export const InfoStep: FC = () => {
  const { data: ratingTables = [], loading: ratingTablesLoading } =
    useRatingTables();

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

      <Form.Control name="ratingGuaranteeBonusPoints">
        {({ value, onChange }) => (
          <Box style={{ maxWidth: 420 }}>
            <Input
              label="Бонус гарантии (места 1–10)"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="10"
              type="primary"
              size="medium"
            />
            <Typography.Text
              size="xSmall"
              type="secondary"
              style={{ display: "block", marginTop: 6 }}
            >
              Сколько баллов добавляется к базе при включённой гарантии для
              топ‑10; по умолчанию 10. Оставьте пустым — подставит сервер.
            </Typography.Text>
          </Box>
        )}
      </Form.Control>

      <Form.Control name="ratingTableId">
        {({ value, onChange }) => (
          <Box style={{ maxWidth: 420 }}>
            <Typography.Text
              size="small"
              type="secondary"
              style={{ display: "block", marginBottom: 6 }}
            >
              Таблица рейтинга
            </Typography.Text>
            <select
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              disabled={ratingTablesLoading || ratingTables.length === 0}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--border-color-grey)",
                backgroundColor: "var(--background-primary)",
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
              <Typography.Text
                size="xSmall"
                type="secondary"
                style={{ display: "block", marginTop: 6 }}
              >
                Загрузка списка таблиц…
              </Typography.Text>
            ) : ratingTables.length === 0 ? (
              <Typography.Text
                size="xSmall"
                type="error"
                style={{ display: "block", marginTop: 6 }}
              >
                Список таблиц недоступен — проверьте API /api/rating-tables
              </Typography.Text>
            ) : null}
          </Box>
        )}
      </Form.Control>

      <Form.Control name="ratingEnabled">
        {({ value, onChange }) => (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
            />
            <Typography.Text size="small">Учитывать в рейтинге</Typography.Text>
          </label>
        )}
      </Form.Control>

      <Form.Listener>
        {({ value }: { value: CreateTournamentForm }) =>
          value.ratingEnabled ? (
            <Box flex={{ col: true, gap: 3 }} style={{ maxWidth: 420 }}>
              <Typography.Text size="xSmall" type="secondary">
                Сезон для сезонного рейтинга (необязательно): укажите год и месяц
                вместе, либо оставьте пустым.
              </Typography.Text>
              <Box flex={{ gap: 3, align: "flex-start", flexWrap: "wrap" }}>
                <Form.Control name="ratingSeasonYear">
                  {({ value: y, onChange: onY }) => (
                    <Box style={{ minWidth: 120 }}>
                      <Input
                        label="Год сезона"
                        value={y}
                        onChange={(e) => onY(e.target.value)}
                        placeholder="2026"
                        type="primary"
                        size="medium"
                      />
                    </Box>
                  )}
                </Form.Control>
                <Form.Control name="ratingSeasonMonth">
                  {({ value: m, onChange: onM }) => (
                    <Box style={{ minWidth: 160 }}>
                      <Typography.Text
                        size="small"
                        type="secondary"
                        style={{ display: "block", marginBottom: 6 }}
                      >
                        Месяц сезона
                      </Typography.Text>
                      <select
                        value={m}
                        onChange={(e) => onM(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: "1px solid var(--border-color-grey)",
                          backgroundColor: "var(--background-primary)",
                          fontSize: 14,
                        }}
                      >
                        <option value="">—</option>
                        {seasonSelectMonthOptions().map((opt) => (
                          <option key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </Box>
                  )}
                </Form.Control>
              </Box>
            </Box>
          ) : (
            <Typography.Text size="xSmall" type="secondary">
              Рейтинг отключён: очки не начисляются (спецформат).
            </Typography.Text>
          )
        }
      </Form.Listener>

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
                <Box flex={{ align: "center", gap: 2 }}>
                  <Typography.Text type="secondary">
                    Вход только Free:
                  </Typography.Text>
                  <Typography.Text>
                    {value.entryFreeOnly === true ? "Да" : "Нет"}
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

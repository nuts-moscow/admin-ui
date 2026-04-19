"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import Link from "next/link";
import { Home } from "lucide-react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PageLayout } from "@/components/PageLayout/PageLayout";
import { Typography } from "@/components/Typography/Typography";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { getSeasonalRating } from "@/core/states/tournaments/requests/getSeasonalRating";
import { usePlayers } from "@/core/states/players/hooks/usePlayers";
import { seasonSelectMonthOptions } from "@/core/states/tournaments/common/seasonFormatting";
import { Input } from "@/components/Input/Input";

export const SeasonalRatingPageView: FC = () => {
  const environment = useEnvironment();
  const { data: players = [] } = usePlayers();
  const now = DateTime.now();
  const [year, setYear] = useState(now.year);
  const [month, setMonth] = useState<number>(now.month);
  const [yearInput, setYearInput] = useState(String(now.year));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<
    readonly {
      readonly playerId: string;
      readonly totalPoints: number;
      readonly tournamentCount: number;
    }[]
  >([]);

  const nickById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of players) {
      m.set(String(p.id), p.nickname);
    }
    return m;
  }, [players]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSeasonalRating(environment, year, month);
        if (cancelled) {
          return;
        }
        if (!res) {
          setEntries([]);
          setError("Не удалось загрузить сезонный рейтинг");
          return;
        }
        setEntries(res.entries);
      } catch {
        if (!cancelled) {
          setEntries([]);
          setError("Ошибка запроса");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [environment, year, month]);

  const applyYearFromInput = () => {
    const t = yearInput.trim();
    if (t === "") {
      return;
    }
    const y = Number.parseInt(t, 10);
    if (!Number.isInteger(y) || y < 2000 || y > 2100) {
      setError("Год: 2000–2100");
      return;
    }
    setError(null);
    setYear(y);
  };

  return (
    <Box
      flex={{ col: true }}
      style={{
        minHeight: "var(--app-min-page-height)",
        backgroundColor: "var(--background-primary)",
      }}
    >
      <PageHeader
        title="Сезонный рейтинг"
        extra={
          <Link href="/">
            <Button type="accent" size="small" iconRight={<Home size={22} />} />
          </Link>
        }
      />
      <PageLayout>
        <Box flex={{ col: true, gap: 4, width: "100%" }}>
          <Box flex={{ gap: 3, align: "flex-end", flexWrap: "wrap" }}>
            <Box style={{ width: 140 }}>
              <Input
                label="Год"
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                onBlur={applyYearFromInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyYearFromInput();
                  }
                }}
                type="primary"
                size="medium"
              />
            </Box>
            <Box style={{ minWidth: 200 }}>
              <Typography.Text
                size="small"
                type="secondary"
                style={{ display: "block", marginBottom: 6 }}
              >
                Месяц
              </Typography.Text>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--border-color-grey)",
                  backgroundColor: "var(--background-primary)",
                  fontSize: 14,
                }}
              >
                {seasonSelectMonthOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Box>
          </Box>
          {error ? (
            <Typography.Text type="error" size="small">
              {error}
            </Typography.Text>
          ) : null}
          {loading ? (
            <Typography.Text type="secondary" size="small">
              Загрузка…
            </Typography.Text>
          ) : (
            <Box
              style={{
                width: "100%",
                overflowX: "auto",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.04)" }}>
                    <th style={{ textAlign: "left", padding: "10px 14px" }}>
                      Игрок
                    </th>
                    <th style={{ textAlign: "right", padding: "10px 14px" }}>
                      Очки
                    </th>
                    <th style={{ textAlign: "right", padding: "10px 14px" }}>
                      Турниров
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        style={{ padding: "16px 14px", color: "#666" }}
                      >
                        Нет данных за выбранный период
                      </td>
                    </tr>
                  ) : (
                    entries.map((row) => (
                      <tr
                        key={row.playerId}
                        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
                      >
                        <td style={{ padding: "10px 14px" }}>
                          {nickById.get(row.playerId) ?? row.playerId}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          {row.totalPoints}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right" }}>
                          {row.tournamentCount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Box>
          )}
        </Box>
      </PageLayout>
    </Box>
  );
};

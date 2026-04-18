"use client";

import { FC, useEffect, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import { useRatingTableMatrix } from "@/core/states/tournaments/hooks/useRatingTableMatrix";
import { useRatingTables } from "@/core/states/tournaments/hooks/useRatingTables";
import {
  matrixColumnIndex,
  type RatingMatrixPlace,
} from "@/core/states/tournaments/requests/getTournamentRatingMatrix";
import { getRatingTableDisplayName } from "@/core/states/tournaments/common/ratingTableDisplayName";

export interface TournamentRatingMatrixProps {
  /** Число участников для подсветки активного столбца. */
  readonly participantCount: number;
  /** Таблица турнира — начальное значение переключателя. */
  readonly defaultRatingTableId?: number;
}

function formatCell(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return String(value);
}

export const TournamentRatingMatrix: FC<TournamentRatingMatrixProps> = ({
  participantCount,
  defaultRatingTableId,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { data: tables = [], loading: tablesLoading } = useRatingTables();
  const [selectedTableId, setSelectedTableId] = useState<number>(() =>
    defaultRatingTableId != null && defaultRatingTableId > 0
      ? defaultRatingTableId
      : 1,
  );

  useEffect(() => {
    if (defaultRatingTableId != null && defaultRatingTableId > 0) {
      setSelectedTableId(defaultRatingTableId);
    }
  }, [defaultRatingTableId]);

  useEffect(() => {
    if (
      tables.length > 0 &&
      !tables.some((t) => t.id === selectedTableId)
    ) {
      setSelectedTableId(tables[0]!.id);
    }
  }, [tables, selectedTableId]);

  const { data: matrix, loading } = useRatingTableMatrix(
    String(selectedTableId),
  );

  const colCount = matrix?.participantRangeLabels.length ?? 0;
  const activeCol =
    matrix != null
      ? matrixColumnIndex(
          participantCount,
          matrix.columnRangeStart,
          colCount,
        )
      : 0;

  return (
    <Box
      flex={{ col: true, gap: 3 }}
      style={{
        backgroundColor: "var(--background-primary)",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      <Box
        flex={{ align: "center", justify: "space-between", flexWrap: "wrap", gap: 2 }}
        style={{ padding: "14px 16px" }}
      >
        <Box flex={{ col: true, gap: 1 }}>
          <Typography.Text bold>Матрица баллов</Typography.Text>
          {participantCount > 0 && matrix && (
            <Typography.Text size="small" type="secondary">
              Участников: {participantCount} → столбец «
              {matrix.participantRangeLabels[activeCol] ?? "…"}»
            </Typography.Text>
          )}
        </Box>
        <Box flex={{ gap: 2, align: "center", flexWrap: "wrap" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            <span>Таблица рейтинга</span>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(Number(e.target.value))}
              disabled={tablesLoading || tables.length === 0}
              style={{
                minWidth: 180,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.12)",
                backgroundColor: "var(--background-primary)",
              }}
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {getRatingTableDisplayName(t)}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="secondary"
            size="small"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Свернуть" : "Показать матрицу"}
          </Button>
        </Box>
      </Box>

      {expanded && (
        <Box style={{ overflowX: "auto", paddingBottom: 16 }}>
          {loading && !matrix && (
            <Box style={{ padding: "16px 16px" }}>
              <Typography.Text type="secondary" size="small">
                Загрузка…
              </Typography.Text>
            </Box>
          )}
          {!loading && !matrix && (
            <Box style={{ padding: "16px 16px" }}>
              <Typography.Text type="error" size="small">
                Не удалось загрузить матрицу
              </Typography.Text>
            </Box>
          )}
          {matrix && (
            <table
              style={{
                borderCollapse: "collapse",
                fontSize: 12,
                minWidth: "max-content",
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "6px 10px",
                      textAlign: "left",
                      position: "sticky",
                      left: 0,
                      backgroundColor: "var(--background-primary)",
                      borderBottom: "1px solid rgba(0,0,0,0.1)",
                      zIndex: 1,
                      whiteSpace: "nowrap",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    Место
                  </th>
                  {matrix.participantRangeLabels.map((label: string, colIdx: number) => (
                    <th
                      key={`${label}-${colIdx}`}
                      style={{
                        padding: "6px 10px",
                        textAlign: "center",
                        borderBottom: "1px solid rgba(0,0,0,0.1)",
                        whiteSpace: "nowrap",
                        fontWeight: colIdx === activeCol ? 700 : 500,
                        color:
                          colIdx === activeCol
                            ? "var(--color-primary, #2563eb)"
                            : "var(--text-secondary)",
                        backgroundColor:
                          colIdx === activeCol
                            ? "rgba(37, 99, 235, 0.07)"
                            : undefined,
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.places.map((row: RatingMatrixPlace, rowIdx: number) => (
                  <tr
                    key={row.place}
                    style={{
                      backgroundColor:
                        rowIdx % 2 === 0
                          ? "transparent"
                          : "rgba(0,0,0,0.02)",
                    }}
                  >
                    <td
                      style={{
                        padding: "5px 10px",
                        position: "sticky",
                        left: 0,
                        backgroundColor:
                          rowIdx % 2 === 0
                            ? "var(--background-primary)"
                            : "rgba(245,245,245,1)",
                        fontWeight: 600,
                        borderRight: "1px solid rgba(0,0,0,0.06)",
                        zIndex: 1,
                      }}
                    >
                      {row.place}
                    </td>
                    {row.basePoints.map((pts: number | null, colIdx: number) => (
                      <td
                        key={colIdx}
                        style={{
                          padding: "5px 10px",
                          textAlign: "center",
                          fontWeight: colIdx === activeCol ? 700 : 400,
                          color:
                            colIdx === activeCol
                              ? "var(--color-primary, #2563eb)"
                              : undefined,
                          backgroundColor:
                            colIdx === activeCol
                              ? "rgba(37, 99, 235, 0.06)"
                              : undefined,
                        }}
                      >
                        {formatCell(pts)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>
      )}
    </Box>
  );
};

"use client";

import { FC, useState } from "react";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { Typography } from "@/components/Typography/Typography";
import {
  useTournamentRatingMatrix,
  refetchTournamentRatingMatrix,
} from "@/core/states/tournaments/hooks/useTournamentRatingMatrix";
import { matrixColumnIndex } from "@/core/states/tournaments/requests/getTournamentRatingMatrix";

export interface TournamentRatingMatrixProps {
  /** Число участников для подсветки активного столбца. */
  readonly participantCount: number;
}

export const TournamentRatingMatrix: FC<TournamentRatingMatrixProps> = ({
  participantCount,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { data: matrix, loading } = useTournamentRatingMatrix();

  const activeCol = matrixColumnIndex(participantCount);

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
        flex={{ align: "center", justify: "space-between" }}
        style={{ padding: "14px 16px" }}
      >
        <Box flex={{ col: true, gap: 1 }}>
          <Typography.Text bold>Матрица баллов</Typography.Text>
          {participantCount > 0 && (
            <Typography.Text size="small" type="secondary">
              Участников: {participantCount} → столбец «
              {matrix?.participantRangeLabels[activeCol] ?? "…"}»
            </Typography.Text>
          )}
        </Box>
        <Box flex={{ gap: 2 }}>
          <Button
            type="secondary"
            size="small"
            onClick={() => {
              refetchTournamentRatingMatrix();
              if (!expanded) setExpanded(true);
            }}
          >
            Обновить
          </Button>
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
                  {matrix.participantRangeLabels.map((label, colIdx) => (
                    <th
                      key={label}
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
                {matrix.places.map((row, rowIdx) => (
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
                    {row.basePoints.map((pts, colIdx) => (
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
                        {pts}
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

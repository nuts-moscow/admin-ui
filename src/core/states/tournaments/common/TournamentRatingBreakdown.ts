/** Разбивка рейтинговых баллов игрока (снимок на момент вылета или итог для completed). */
export interface TournamentRatingBreakdown {
  /** Баллы за место из матрицы × коэффициент (уже включает гарантию топ-10 если применялась). */
  readonly fromTable: number;
  /** Баунти-баллы: bountyCount × 0.5 × ratingBountyCoefficient. */
  readonly bounty: number;
  /** Ручная правка (только для completed; 0 по умолчанию). */
  readonly manualAdjustment: number;
  /** fromTable + bounty + manualAdjustment. */
  readonly totalPoints: number;
}

function pickFiniteNumber(...vals: unknown[]): number | undefined {
  for (const v of vals) {
    if (typeof v === "number" && Number.isFinite(v)) {
      return v;
    }
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) {
        return n;
      }
    }
  }
  return undefined;
}

/**
 * Приводит ответ API к camelCase и заполняет пропуски нулями.
 * Поддерживает snake_case: from_table, total_points, manual_adjustment.
 */
export function normalizeRatingBreakdown(
  raw: unknown,
): TournamentRatingBreakdown | undefined {
  if (raw == null || typeof raw !== "object") {
    return undefined;
  }
  const o = raw as Record<string, unknown>;
  const fromTable =
    pickFiniteNumber(o.fromTable, o.from_table) ?? 0;
  const bounty =
    pickFiniteNumber(o.bounty, o.bounty_points, o.bountyPoints) ?? 0;
  const manualAdjustment =
    pickFiniteNumber(o.manualAdjustment, o.manual_adjustment) ?? 0;
  const totalExplicit = pickFiniteNumber(o.totalPoints, o.total_points);
  const totalPoints =
    totalExplicit != null
      ? totalExplicit
      : fromTable + bounty + manualAdjustment;
  return {
    fromTable,
    bounty,
    manualAdjustment,
    totalPoints,
  };
}

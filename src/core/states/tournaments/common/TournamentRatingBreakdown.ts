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

const FROM_TABLE_KEYS: readonly string[] = [
  "fromTable",
  "from_table",
  "basePoints",
  "base_points",
  "tablePoints",
  "table_points",
  "placePoints",
  "place_points",
  "matrixPoints",
  "matrix_points",
  "fromMatrix",
  "from_matrix",
  "pointsFromTable",
  "points_from_table",
];

function pickFromTable(o: Record<string, unknown>): number | undefined {
  const nums = FROM_TABLE_KEYS.map((k) => o[k]).filter((v) => v !== undefined);
  return pickFiniteNumber(...nums);
}

const RECONCILE_EPS = 1e-4;

/**
 * Приводит ответ API к camelCase и заполняет пропуски нулями.
 * Поддерживает snake_case и альтернативные имена полей «за место».
 * Если задан total, а сумма (за место + баунти + корр.) не совпадает — «за место»
 * восстанавливается из итога (источник правды на бэке).
 */
export function normalizeRatingBreakdown(
  raw: unknown,
): TournamentRatingBreakdown | undefined {
  if (raw == null || typeof raw !== "object") {
    return undefined;
  }
  const o = raw as Record<string, unknown>;
  let fromTable = pickFromTable(o) ?? 0;
  const bounty =
    pickFiniteNumber(o.bounty, o.bounty_points, o.bountyPoints) ?? 0;
  const manualAdjustment =
    pickFiniteNumber(o.manualAdjustment, o.manual_adjustment) ?? 0;
  const totalExplicit = pickFiniteNumber(o.totalPoints, o.total_points);
  let totalPoints =
    totalExplicit != null
      ? totalExplicit
      : fromTable + bounty + manualAdjustment;

  if (totalExplicit != null) {
    const sumParts = fromTable + bounty + manualAdjustment;
    if (Math.abs(sumParts - totalExplicit) > RECONCILE_EPS) {
      fromTable = totalExplicit - bounty - manualAdjustment;
      totalPoints = totalExplicit;
    }
  }

  return {
    fromTable,
    bounty,
    manualAdjustment,
    totalPoints,
  };
}

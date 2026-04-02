import { InGamePlayerState } from "./InGamePlayerState";
import { TournamentsStructureResponse } from "./TournamentsStructureResponse";

/** Минимум полей структуры для fallback, если нет allowedReentryCount у игрока (старый бэкенд). */
export type ReentryStructureHint = Pick<
  TournamentsStructureResponse,
  "freezeOutEnabled" | "maxReentries"
>;

const DEFAULT_LEGACY_MAX = 5;

function finiteNonNegativeInt(n: unknown): number | undefined {
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  return Math.max(0, Math.floor(n));
}

/**
 * Эффективный потолок реентри для экранов: приоритет — allowedReentryCount с игрока;
 * иначе freeze-out / maxReentries из структуры; без структуры — совместимость с лимитом 5.
 */
export function getAllowedReentryCount(
  player: Pick<InGamePlayerState, "allowedReentryCount">,
  structure?: ReentryStructureHint | null,
): number {
  const fromPlayer = finiteNonNegativeInt(player.allowedReentryCount);
  if (fromPlayer != null) {
    return fromPlayer;
  }
  if (structure) {
    return structure.freezeOutEnabled
      ? 0
      : finiteNonNegativeInt(structure.maxReentries) ?? DEFAULT_LEGACY_MAX;
  }
  return DEFAULT_LEGACY_MAX;
}

export function getReentryRemaining(
  player: Pick<
    InGamePlayerState,
    "totalReentryCount" | "allowedReentryCount"
  >,
  structure?: ReentryStructureHint | null,
): number {
  const cap = getAllowedReentryCount(player, structure);
  const used = finiteNonNegativeInt(player.totalReentryCount) ?? 0;
  return Math.max(0, cap - used);
}

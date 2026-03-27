export type PlayerStatus =
  | "Registered"
  | "InGamePaid"
  | "InGameNotPaid"
  | "Out"
  | "OutNotPaid";

export type PaymentMethod = "Cache" | "CreditCard" | "Free";

export const InGameBonus = {
  EarlyBird: "EarlyBird",
  First20: "First20",
  Hookah: "Hookah",
  Diller: "Diller",
  /** Бонус дня */
  BonusOfTheDay: "BonusOfTheDay",
} as const;

export type Bonus = (typeof InGameBonus)[keyof typeof InGameBonus];

export const tournamentBonusLabels: Record<Bonus, string> = {
  EarlyBird: "Ранняя пташка",
  First20: "First 20",
  Hookah: "Кальян",
  Diller: "Диллер",
  BonusOfTheDay: "Бонус дня",
};

export interface BountyKillEntry {
  readonly playerId: string;
  readonly playerName?: string;
}

export type BurnedStackSource = "Rebuy" | "Out";

export interface BurnedStackEvent {
  readonly chips: number;
  readonly source: BurnedStackSource;
}

export interface InGamePlayerState {
  readonly playerId: string;
  readonly tournamentPlayerId: string;
  // Kept for current UI rendering compatibility in current screens.
  readonly playerName: string;
  readonly status: PlayerStatus;
  readonly tableId?: string;
  readonly entryPaymentMethod?: PaymentMethod;
  // Legacy typo field; keep optional until all usages are migrated.
  readonly entyPaymentMethod?: PaymentMethod;
  readonly reentryByPaymentMethod: PaymentMethod[];
  readonly totalReentryCount: number;
  readonly bountyCount: number;
  /** ID жертв — playerId (строка или объект с playerId). */
  readonly bountyKills?: (BountyKillEntry | string)[];
  readonly eliminatedBy?: string[];
  readonly bonuses: Bonus[];
  /** Переменные бонусы (фишки); каждое число — отдельный грант. */
  readonly customBonusChips?: readonly number[];
  readonly freeEntryCount: number;
  /** Бесплатные входы только в этом турнире (оплата входа Free). */
  readonly tournamentFreeEntryCount?: number;
  readonly freeReentryCount: number;
  /** Бесплатные ребаи только в этом турнире (оплата ребая Free). */
  readonly tournamentFreeReentryCount?: number;
  readonly placement?: number;
  // Legacy field used by current reentry UI.
  readonly unpaidReentryCount: number;
  /** Подписан ли договор (v2/api/tournaments/{id}/players). */
  readonly signAgreement?: boolean;
  /** Сгорания стека по событиям; откат ребая — только source=Rebuy. */
  readonly burnedStackEvents?: readonly BurnedStackEvent[];
}

/** Есть ли у игрока бесплатный вход (глобально или в турнире) для способа оплаты Free. */
export function playerHasFreeEntryOption(
  player?:
    | Pick<InGamePlayerState, "freeEntryCount" | "tournamentFreeEntryCount">
    | null,
): boolean {
  return (
    (player?.freeEntryCount ?? 0) > 0 ||
    (player?.tournamentFreeEntryCount ?? 0) > 0
  );
}

/** Есть ли у игрока бесплатный ребай (глобально или в турнире) для способа оплаты Free. */
export function playerHasFreeReentryOption(
  player?:
    | Pick<
        InGamePlayerState,
        "freeReentryCount" | "tournamentFreeReentryCount"
      >
    | null,
): boolean {
  return (
    (player?.freeReentryCount ?? 0) > 0 ||
    (player?.tournamentFreeReentryCount ?? 0) > 0
  );
}

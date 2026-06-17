import { TournamentRatingBreakdown } from "./TournamentRatingBreakdown";

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
  /** Для отката POST .../bounty/eliminate/undo с телом { eventId }. */
  readonly eventId?: string;
}

/** Одно событие выбивания жертвы (несколько убийц — одна операция, один откат). */
export interface BountyEliminationEventRef {
  readonly eventId: string;
  readonly killerPlayerIds: readonly string[];
}

/** Событие из стейта игрока (v2 players): отображение и откат по eventId. */
export interface BountyEliminationEventState {
  readonly eventId: string;
  readonly eliminatedPlayerId: string;
  readonly killerPlayerIds: readonly string[];
  /** Тип выбивания: "Out" — финальный вылет, "Rebuy" — выбивание на ребае. Опционально для совместимости со старым бэком. */
  readonly type?: "Rebuy" | "Out";
  /** Время записи события, epoch ms (null/undefined для legacy-записей без отметки времени). */
  readonly recordedAt?: number | null;
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
  /** Фактически учтённая сумма входа (после оплаты со скидкой и т.п.), если отдаёт API. */
  readonly entryPaidAmount?: number;
  /**
   * Суммы по оплаченным ребеям в том же порядке, что развёрнутый список методов реентри.
   * Если отдаёт API.
   */
  readonly reentryPaidAmounts?: readonly number[];
  readonly totalReentryCount: number;
  /**
   * Эффективный максимум реентри на турнир (0 при freeze-out, иначе maxReentries).
   * Брать с API, не вычислять по freezeOut на фронте.
   */
  readonly allowedReentryCount?: number;
  /** Доли баунти допускаются (например 0.5 при split 1/2). */
  readonly bountyCount: number;
  /** ID жертв — playerId (строка или объект с playerId). */
  readonly bountyKills?: (BountyKillEntry | string)[];
  readonly eliminatedBy?: string[];
  /** Если бэкенд отдаёт — один ряд = одно событие eliminate, откат по eventId. */
  readonly eliminatedByEvents?: readonly BountyEliminationEventRef[];
  /** События выбивания с сервера: для убийцы — свои участия, для жертвы — где eliminatedPlayerId = этот игрок. */
  readonly bountyEliminationEvents?: readonly BountyEliminationEventState[];
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
  /**
   * Рейтинговый снимок игрока.
   * InProgress: заполнен только у вылетевших (Out).
   * Completed: заполнен у всех (итог + manualAdjustment).
   */
  readonly rating?: TournamentRatingBreakdown;
  /**
   * Накопитель баллов «вне места» (Redis); не обнуляется при return-to-game.
   * Дублируется в rating.nonPlacementAccrued внутри снимка, если бэк отдаёт в breakdown.
   */
  readonly ratingNonPlacementAccrued?: number;
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

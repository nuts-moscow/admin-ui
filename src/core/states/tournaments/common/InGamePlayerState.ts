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
  readonly freeEntryCount: number;
  readonly freeReentryCount: number;
  readonly placement?: number;
  // Legacy field used by current reentry UI.
  readonly unpaidReentryCount: number;
  /** Подписан ли договор (v2/api/tournaments/{id}/players). */
  readonly signAgreement?: boolean;
}

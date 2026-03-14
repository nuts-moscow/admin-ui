export type PlayerStatus =
  | "Registered"
  | "InGamePaid"
  | "InGameNotPaid"
  | "Out"
  | "OutNotPaid";

export type PaymentMethod = "Cache" | "CreditCard" | "Free";

export type Bonus = "EarlyBird" | "Hookah" | "Diller";

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
  readonly bountyKills?: BountyKillEntry[];
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

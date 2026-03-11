export type PlayerStatus =
  | "Registered"
  | "InGamePaid"
  | "InGameNotPaid"
  | "Out";

export type PaymentMethod = "Cache" | "CreditCard" | "Free";

export type Bonus = "EarlyBird" | "Hookah" | "Diller";

export interface InGamePlayerState {
  readonly playerId: number;
  // Kept for current UI rendering compatibility.
  readonly playerName: string;
  readonly status: PlayerStatus;
  readonly tableId?: number;
  readonly entyPaymentMethod?: PaymentMethod;
  readonly reentryByPaymentMethod?: Array<[PaymentMethod, number]>;
  readonly bountyCount: number;
  readonly bonuses?: Array<[Bonus, number]>;
  readonly freeEntryCount: number;
  readonly freeReentryCount: number;
  readonly placement?: number;
}

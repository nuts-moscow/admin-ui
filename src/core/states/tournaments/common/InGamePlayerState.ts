export type PlayerStatus =
  | "Registered"
  | "InGamePaid"
  | "InGameNotPaid"
  | "Out";

export type PaymentMethod = "Cache" | "CreditCard" | "Free";

export type Bonus = "EarlyBird" | "Hookah" | "Diller";

export interface InGamePlayerState {
  readonly playerId: number;
  readonly playerName: string;
  readonly status: PlayerStatus;
  readonly tableId?: number;
  readonly entyPaymentMethod?: PaymentMethod;
  readonly reentryCount: number;
  readonly reentyPaymentMethod?: PaymentMethod;
  readonly bountyCount: number;
  readonly paidReentryCount: number;
  readonly bonuses?: Array<[Bonus, number]>;
  readonly freeReentryCount: number;
  readonly freeEntryCount?: number;
}

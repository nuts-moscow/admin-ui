import { Bonus, PaymentMethod, PlayerStatus } from "./InGamePlayerState";

export interface InGameBonusUpdateRequest {
  readonly bonus: Bonus;
  readonly count: number;
}

export interface UpdatePlayerStateRequest {
  readonly tournamentId: number;
  readonly playerId: string;
  readonly status?: PlayerStatus;
  readonly entryPaymentMethod?: PaymentMethod;
  readonly entyPaymentMethod?: PaymentMethod;
  readonly reentyPaymentMethod?: PaymentMethod;
  readonly tableId?: string;
  readonly reentryCount?: number;
  readonly reentryByPaymentMethod?: PaymentMethod[];
  readonly bountyCount?: number;
  readonly paidReentryCount?: number;
  readonly bonuses?: InGameBonusUpdateRequest[];
  readonly freeReentryUsed: number;
  readonly freeEntryUsed: number;
}

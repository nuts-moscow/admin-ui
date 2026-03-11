import { Bonus, PaymentMethod, PlayerStatus } from "./InGamePlayerState";

export interface InGameBonusUpdateRequest {
  readonly bonus: Bonus;
  readonly count: number;
}

export interface UpdatePlayerStateRequest {
  readonly tournamentId: number;
  readonly playerId: number;
  readonly status?: PlayerStatus;
  readonly entyPaymentMethod?: PaymentMethod;
  readonly reentyPaymentMethod?: PaymentMethod;
  readonly tableId?: number;
  readonly reentryCount?: number;
  readonly bountyCount?: number;
  readonly paidReentryCount?: number;
  readonly bonuses?: InGameBonusUpdateRequest[];
  readonly freeReentryUsed: number;
  readonly freeEntryUsed: number;
}

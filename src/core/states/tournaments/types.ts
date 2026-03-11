import { TournamentStatus } from "./common/TournamentStatus";
import { Bonus, PaymentMethod, PlayerStatus } from "./common/InGamePlayerState";
export type {
  Bonus,
  PaymentMethod,
  PlayerStatus,
  InGamePlayerState,
} from "./common/InGamePlayerState";

export interface MakeTournamentStructureRequest {
  readonly name: string;
  readonly playersLimit: number;
  readonly stackSize: number;
  readonly freezeOutEnabled: boolean;
  readonly blinds?: Array<Blind | Break>;
}

export interface MakeTournamentRequest {
  readonly name: string;
  readonly date: number;
  readonly structure: MakeTournamentStructureRequest;
}

export interface UpdateTournamentRequest {
  readonly id: string;
  readonly name: string;
  readonly date: number;
  readonly structure: MakeTournamentStructureRequest;
  readonly status: TournamentStatus;
}

export interface UpdatePlayerStateRequest {
  readonly tournamentId: string;
  readonly playerId: number;
  readonly status?: PlayerStatus;
  readonly entyPaymentMethod?: PaymentMethod;
  readonly reentyPaymentMethod?: PaymentMethod;
  readonly tableId?: number;
  readonly reentryCount?: number;
  readonly bountyCount?: number;
  readonly paidReentryCount?: number;
  readonly bonuses?: Array<{ bonus: Bonus; count: number }>;
}

export interface Blind {
  readonly level: number;
  readonly id: number;
  readonly smallBlind: number;
  readonly bigBlind: number;
  readonly ante: boolean;
  readonly duration: number;
}

export interface Break {
  readonly id: number;
  readonly duration: number;
}

export interface NotFound {
  readonly what: string;
}

export interface Unknown {
  readonly code: number;
  readonly msg: string;
}

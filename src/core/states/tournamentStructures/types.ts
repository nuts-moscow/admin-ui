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

export type BlindType = Blind | Break;

export interface TournamentStructure {
  readonly id: number;
  readonly name: string;
  readonly playersLimit: number;
  readonly bigBlindOnStart: number;
  readonly smallBlindOnStart: number;
}

export interface MakeTournamentStructureRequest {
  readonly name: string;
  readonly playersLimit: number;
  readonly stackSize: number;
  readonly freezeOutEnabled: boolean;
  readonly blinds?: BlindType[];
}

export interface UpdateTournamentStructureRequest extends MakeTournamentStructureRequest {
  readonly id: number;
}


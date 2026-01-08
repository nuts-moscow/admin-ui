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

export type Blinds = [Blind, ...BlindType[]];

export interface TournamentStructure {
  readonly id: number;
  readonly name: string;
  readonly playersLimit: number;
  readonly bigBlindOnStart: number;
  readonly smallBlindOnStart: number;
}

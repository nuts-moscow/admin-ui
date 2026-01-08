import { Blinds } from "./BlindType";

export interface TournamentStructure {
  readonly id: number;
  readonly name: string;
  readonly playersLimit: number;
  readonly blindsStructure: Blinds;
}

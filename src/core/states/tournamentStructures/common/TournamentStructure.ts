import { Blinds } from "./BlindType";

export interface TournamentStructure {
  readonly id: number;
  readonly name: string;
  readonly playersLimit: number;
  readonly stackSize: number;
  readonly freezeOutEnabled: boolean;
  /** Лимит реентри на игрока (не freeze-out); может отсутствовать до первого сохранения. */
  readonly maxReentries?: number;
  readonly blindsStructure: Blinds;
}

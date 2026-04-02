import { TournamentStatus } from "./TournamentStatus";
import { Blinds } from "@/core/states/tournamentStructures/common/BlindType";

export interface MakeTournamentStructureRequest {
  readonly name: string;
  readonly playersLimit: number;
  readonly stackSize: number;
  readonly freezeOutEnabled: boolean;
  readonly entryFreeOnly?: boolean;
  /** Не freeze-out; если не передать — дефолт на бэке 5. */
  readonly maxReentries?: number;
  readonly blindsStructure?: Blinds;
}

export interface UpdateTournamentRequest {
  readonly id: number;
  readonly name: string;
  readonly date: number;
  readonly structure: MakeTournamentStructureRequest;
  readonly status: TournamentStatus;
}

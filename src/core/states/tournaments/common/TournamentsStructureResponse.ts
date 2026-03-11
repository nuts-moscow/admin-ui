import { Blinds } from "@/core/states/tournamentStructures/common/BlindType";

export interface TournamentsStructureResponse {
  readonly id: number;
  readonly name: string;
  readonly stackSize: number;
  readonly playersLimit: number;
  readonly blindsStructure?: Blinds;
  readonly freezeOutEnabled: boolean;
}

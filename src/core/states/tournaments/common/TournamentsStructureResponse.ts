import { Blinds } from "@/core/states/tournamentStructures/common/BlindType";

export interface TournamentsStructureResponse {
  readonly id: number;
  readonly name: string;
  readonly stackSize: number;
  readonly playersLimit: number;
  readonly blindsStructure?: Blinds;
  readonly freezeOutEnabled: boolean;
  /** Цена входа в турнир (как на бэке). Может приходить как entry_price в JSON. */
  readonly entryPrice?: number;
  /** Цена одного ребая (как на бэке). Может приходить как reentry_price в JSON. */
  readonly reentryPrice?: number;
}

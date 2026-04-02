import { Blinds } from "@/core/states/tournamentStructures/common/BlindType";

export interface TournamentsStructureResponse {
  readonly id: number;
  readonly name: string;
  readonly stackSize: number;
  readonly playersLimit: number;
  readonly blindsStructure?: Blinds;
  readonly freezeOutEnabled: boolean;
  /**
   * Первый бай-ин только способом Free (при отсутствии поля — false).
   * На реентри не влияет.
   */
  readonly entryFreeOnly?: boolean;
  /** Сохранённый лимит реентри; при отсутствии на бэке при сохранении подставляется 5. */
  readonly maxReentries?: number;
  /**
   * Производное поле в ответе турнира (если отдаёт API): то же, что у игрока allowedReentryCount.
   */
  readonly allowedReentryCount?: number;
  /** Цена входа в турнир (как на бэке). Может приходить как entry_price в JSON. */
  readonly entryPrice?: number;
  /** Цена одного ребая (как на бэке). Может приходить как reentry_price в JSON. */
  readonly reentryPrice?: number;
}

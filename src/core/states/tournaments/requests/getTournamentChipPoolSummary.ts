import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface ChipPoolBonusLine {
  readonly bonus: string;
  readonly count: number;
  readonly chipsPerUnit: number;
  readonly totalChips: number;
}

export interface TournamentChipPoolSummary {
  readonly playersArrived: number;
  readonly playersActive: number;
  readonly rebuyCount: number;
  readonly averageStack: number | null;
  readonly stackSize: number;
  readonly entryUnits: number;
  readonly baseChips: number;
  readonly bonuses: ChipPoolBonusLine[];
  readonly bonusChipsTotal: number;
  readonly totalChips: number;
}

export const getTournamentChipPoolSummary = async (
  environment: Environment,
  tournamentId: string
): Promise<TournamentChipPoolSummary | null> => {
  const id = tournamentId.trim();
  if (!id) return null;

  return securedFetch<undefined, TournamentChipPoolSummary | null>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${encodeURIComponent(id)}/chip-pool-summary`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      404: () => null,
      500: () => null,
      unknownError: async (res) => {
        if (res.status === 422) {
          const body = (await res.toJson().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            body.error ??
              "Для завершённого турнира в снимке кассы нет размера стека"
          );
        }
        return null;
      },
    },
  });
};

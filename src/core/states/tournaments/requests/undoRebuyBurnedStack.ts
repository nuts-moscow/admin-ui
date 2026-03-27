import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface RebuyBurnedStackUndoBody {
  readonly playerId: string;
  readonly burnedChips: number;
}

/**
 * POST /v2/api/tournaments/{tournamentId}/bounty/rebuy-burned-stack/undo — успех 204.
 */
export const undoRebuyBurnedStack = async (
  environment: Environment,
  tournamentId: number | string,
  body: RebuyBurnedStackUndoBody,
): Promise<void> => {
  const tid = encodeURIComponent(String(tournamentId));
  return securedFetch<RebuyBurnedStackUndoBody, void, void>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tid}/bounty/rebuy-burned-stack/undo`,
    withCredentials: false,
    body,
    mapping: {
      success: async (res) => {
        if (res.status === 204) {
          return;
        }
        await res.toJson().catch(() => undefined);
      },
      400: () =>
        new Error(
          "Некорректное тело или нет подходящего сгорания ребая / нельзя уменьшить reentry",
        ),
      404: () => new Error("Игрок не в турнире"),
      500: () => new Error("Server error"),
    },
  });
};

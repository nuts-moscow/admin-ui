import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { InGamePlayerState } from "../common/InGamePlayerState";

export interface TournamentPlayerBountyRemoveBody {
  /** Доля баунти к снятию (дробь допустима). */
  readonly bountyCountToRemove?: number;
  /** Сколько учтённых реентри убрать из счётчика. */
  readonly reentryCountToRemove?: number;
}

export const tournamentPlayerBountyRemove = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  body: TournamentPlayerBountyRemoveBody,
): Promise<InGamePlayerState> => {
  const payload: Record<string, number> = {};
  if (
    body.bountyCountToRemove != null &&
    Number.isFinite(body.bountyCountToRemove) &&
    body.bountyCountToRemove > 0
  ) {
    payload.bountyCountToRemove = body.bountyCountToRemove;
  }
  if (
    body.reentryCountToRemove != null &&
    Number.isFinite(body.reentryCountToRemove) &&
    Number.isInteger(body.reentryCountToRemove) &&
    body.reentryCountToRemove >= 1
  ) {
    payload.reentryCountToRemove = body.reentryCountToRemove;
  }
  return securedFetch<Record<string, number>, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${encodeURIComponent(playerId)}/bounty/remove`,
    withCredentials: true,
    body: payload,
    mapping: {
      success: (res) => res.toJson(),
      404: () => new Error("Player or tournament not found"),
      500: () => new Error("Server error"),
    },
  });
};

import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { InGamePlayerState } from "../common/InGamePlayerState";

export type BountyEliminationType = "Rebuy" | "Out";

export interface BountyEliminateBody {
  readonly eliminatedPlayerId: string;
  readonly killerPlayerId: string;
  readonly type: BountyEliminationType;
}

export const bountyEliminate = async (
  environment: Environment,
  tournamentId: number | string,
  body: BountyEliminateBody,
): Promise<InGamePlayerState> => {
  return securedFetch<BountyEliminateBody, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/bounty/eliminate`,
    withCredentials: false,
    body,
    mapping: {
      success: (res) => null as any,
      400: () => new Error("Invalid bounty eliminate data"),
      404: () => new Error("Tournament or players not found"),
      500: () => new Error("Server error"),
    },
  });
};

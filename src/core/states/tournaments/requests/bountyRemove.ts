import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface BountyRemoveBody {
  readonly killerPlayerId: string;
  readonly victimPlayerId: string;
}

export const bountyRemove = async (
  environment: Environment,
  tournamentId: number | string,
  body: BountyRemoveBody,
): Promise<void> => {
  await securedFetch<BountyRemoveBody, void>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/bounty/remove`,
    withCredentials: false,
    body,
    mapping: {
      success: () => undefined,
      400: () => new Error("Invalid request body"),
      404: () => new Error("Kill record or player not found"),
      500: () => new Error("Server error"),
    },
  });
};

import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { InGamePlayerState } from "../common/InGamePlayerState";

export interface AddReentryRequest {
  readonly tournamentId: string | number;
  readonly playerId: string;
  readonly count: number;
}

interface ReentryCountBody {
  readonly count: number;
}

export const addReentry = async (
  environment: Environment,
  request: AddReentryRequest
): Promise<InGamePlayerState> => {
  return securedFetch<ReentryCountBody, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${request.tournamentId}/players/${request.playerId}/reentry`,
    withCredentials: false,
    body: {
      count: request.count,
    },
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid reentry data"),
      404: () => new Error("Tournament or player not found"),
      500: () => new Error("Server error"),
    },
  });
};

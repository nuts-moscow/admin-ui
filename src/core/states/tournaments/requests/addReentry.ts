import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { InGamePlayerState } from "../common/InGamePlayerState";

export interface AddReentryRequest {
  readonly tournamentId: number;
  readonly playerId: number;
  readonly count: number;
}

export const addReentry = async (
  environment: Environment,
  request: AddReentryRequest
): Promise<InGamePlayerState> => {
  return securedFetch<AddReentryRequest, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: "/v1/tournaments/add-reentry",
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid reentry data"),
      404: () => new Error("Tournament or player not found"),
      500: () => new Error("Server error"),
    },
  });
};

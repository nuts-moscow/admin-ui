import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { InGamePlayerState, PaymentMethod } from "../common/InGamePlayerState";

export interface AddReentryPaymentRequest {
  readonly payments: PaymentMethod[];
}

export const addReentryPayment = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  request: AddReentryPaymentRequest
): Promise<InGamePlayerState> => {
  return securedFetch<AddReentryPaymentRequest, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/reentry-payment`,
    withCredentials: false,
    body: request,
    mapping: {
      success: (res) => res.toJson(),
      400: () => new Error("Invalid reentry payment data"),
      404: () => new Error("Tournament or player not found"),
      500: () => new Error("Server error"),
    },
  });
};

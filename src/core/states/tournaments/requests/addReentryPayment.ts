import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";
import { InGamePlayerState, PaymentMethod } from "../common/InGamePlayerState";

export interface AddReentryPaymentRequest {
  readonly payments: PaymentMethod[];
  /** Длина должна совпадать с payments; Free → 0; опустить = полные цены из турнира. */
  readonly paidAmounts?: readonly number[];
}

export const addReentryPayment = async (
  environment: Environment,
  tournamentId: number,
  playerId: string,
  request: AddReentryPaymentRequest,
): Promise<InGamePlayerState> => {
  const body: Record<string, unknown> = {
    payments: request.payments,
  };
  if (
    request.paidAmounts != null &&
    request.paidAmounts.length === request.payments.length
  ) {
    body.paidAmounts = request.paidAmounts.map((n) => Math.round(n));
  }
  return securedFetch<Record<string, unknown>, InGamePlayerState>({
    method: "POST",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${tournamentId}/players/${playerId}/reentry-payment`,
    withCredentials: false,
    body,
    mapping: {
      success: (res) => res.toJson(),
      404: () => new Error("Tournament or player not found"),
      500: () => new Error("Server error"),
    },
  });
};

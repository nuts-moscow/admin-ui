import { securedFetch } from "@/core/utils/misc/securedFetch";
import { Environment } from "../../environment/Environment";

export interface PaymentMethodSummary {
  readonly entryCount: number;
  readonly reentryCount: number;
  readonly sum: number;
}

export interface TournamentCashRegisterResponse {
  readonly cash: PaymentMethodSummary;
  readonly card: PaymentMethodSummary;
  readonly free: PaymentMethodSummary;
  readonly total: PaymentMethodSummary;
}

export const getTournamentCashRegister = async (
  environment: Environment,
  tournamentId: string
): Promise<TournamentCashRegisterResponse | null> => {
  return securedFetch<undefined, TournamentCashRegisterResponse | null>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v1/tournaments/cash-register?tournamentId=${tournamentId}`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: (res) => res.toJson(),
      400: () => null,
      404: () => null,
      500: () => null,
      unknownError: () => null,
    },
  });
};

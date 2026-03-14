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

/** CashDeskLine из v2 (quantity, amount). */
interface CashDeskLine {
  readonly quantity: number;
  readonly amount: number;
}

/** CashDeskCategory из v2 (total, entries, rebuys). */
interface CashDeskCategory {
  readonly total: CashDeskLine;
  readonly entries: CashDeskLine;
  readonly rebuys: CashDeskLine;
}

/** CashDeskResponse: GET v2/api/tournaments/{tournamentId}/cash-desk. */
interface CashDeskResponse {
  readonly cash: CashDeskCategory;
  readonly card: CashDeskCategory;
  readonly free: CashDeskCategory;
  readonly grandTotal: CashDeskCategory;
}

function toPaymentMethodSummary(cat: CashDeskCategory): PaymentMethodSummary {
  return {
    entryCount: cat.entries?.quantity ?? 0,
    reentryCount: cat.rebuys?.quantity ?? 0,
    sum: cat.total?.amount ?? 0,
  };
}

/**
 * GET /v2/api/tournaments/{tournamentId}/cash-desk — касса турнира.
 * Ответ мапится в TournamentCashRegisterResponse для совместимости с UI.
 */
export const getTournamentCashRegister = async (
  environment: Environment,
  tournamentId: string
): Promise<TournamentCashRegisterResponse | null> => {
  const id = tournamentId.trim();
  if (!id) return null;

  const raw = await securedFetch<undefined, CashDeskResponse | null>({
    method: "GET",
    host: environment.apiUrl,
    path: `/v2/api/tournaments/${encodeURIComponent(id)}/cash-desk`,
    withCredentials: false,
    body: undefined,
    mapping: {
      success: async (res) => (await res.toJson()) as CashDeskResponse,
      400: () => null,
      404: () => null,
      500: () => null,
      unknownError: () => null,
    },
  });

  if (!raw) return null;

  return {
    cash: toPaymentMethodSummary(raw.cash),
    card: toPaymentMethodSummary(raw.card),
    free: toPaymentMethodSummary(raw.free),
    total: toPaymentMethodSummary(raw.grandTotal),
  };
};

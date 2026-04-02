import {
  InGamePlayerState,
  PaymentMethod,
  playerHasFreeEntryOption,
} from "./InGamePlayerState";

/**
 * Способы оплаты первого входа (entry). Реентри этим списком не ограничивать.
 */
export function getEntryPaymentMethodOptionsForFirstBuyin(
  player: InGamePlayerState | undefined,
  entryFreeOnly: boolean,
): PaymentMethod[] {
  if (entryFreeOnly) {
    return ["Free"];
  }
  const base: PaymentMethod[] = ["CreditCard", "Cache"];
  if (playerHasFreeEntryOption(player)) {
    return [...base, "Free"];
  }
  return base;
}

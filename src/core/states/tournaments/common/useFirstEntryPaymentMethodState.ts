"use client";

import { useEffect, useMemo, useState } from "react";
import {
  InGamePlayerState,
  PaymentMethod,
  playerHasFreeEntryOption,
} from "./InGamePlayerState";
import { getEntryPaymentMethodOptionsForFirstBuyin } from "./entryPaymentOptions";

/**
 * Состояние выбора способа оплаты первого бай-ина с учётом entryFreeOnly.
 */
export function useFirstEntryPaymentMethodState(
  player: InGamePlayerState | undefined,
  entryFreeOnly: boolean,
): {
  readonly paymentMethod: PaymentMethod;
  readonly setPaymentMethod: (m: PaymentMethod) => void;
  readonly paymentMethodOptions: PaymentMethod[];
  /** entryFreeOnly, но у игрока нет бесплатных входов — сохранять нельзя. */
  readonly freeOnlyBlocked: boolean;
} {
  const paymentMethodOptions = useMemo(
    () => getEntryPaymentMethodOptionsForFirstBuyin(player, entryFreeOnly),
    [player, entryFreeOnly],
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() =>
    paymentMethodOptions[0] ?? "CreditCard",
  );

  useEffect(() => {
    if (entryFreeOnly) {
      setPaymentMethod("Free");
      return;
    }
    setPaymentMethod((prev) =>
      paymentMethodOptions.includes(prev)
        ? prev
        : (paymentMethodOptions[0] ?? "CreditCard"),
    );
  }, [player?.playerId, entryFreeOnly, paymentMethodOptions]);

  useEffect(() => {
    if (
      paymentMethod === "Free" &&
      !playerHasFreeEntryOption(player) &&
      !entryFreeOnly
    ) {
      setPaymentMethod("CreditCard");
    }
  }, [paymentMethod, player, entryFreeOnly]);

  const freeOnlyBlocked =
    entryFreeOnly === true && !playerHasFreeEntryOption(player);

  return {
    paymentMethod,
    setPaymentMethod,
    paymentMethodOptions,
    freeOnlyBlocked,
  };
}

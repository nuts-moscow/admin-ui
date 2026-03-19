import { PaymentMethod } from "./InGamePlayerState";

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: "Карта",
  cache: "Наличные",
  free: "Бесплатно",
  CreditCard: "Карта",
  Cache: "Наличные",
  Free: "Бесплатно",
};

export const getPaymentMethodLabel = (
  paymentMethod?: PaymentMethod | string,
): string => {
  if (!paymentMethod) {
    return "-";
  }
  return PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod;
};

"use client";

import { FC } from "react";
import { Typography } from "@/components/Typography/Typography";
import { PaymentMethod } from "@/core/states/tournaments/common/InGamePlayerState";

export interface EntryPaidAmountInputProps {
  readonly entryPrice?: number;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly paymentMethod: PaymentMethod;
  readonly disabled?: boolean;
}

/** Поле суммы оплаты входа: пусто = полная цена с бэка; иначе фактическая сумма (скидка). */
export const EntryPaidAmountInput: FC<EntryPaidAmountInputProps> = ({
  entryPrice,
  value,
  onChange,
  paymentMethod,
  disabled,
}) => {
  if (paymentMethod === "Free") {
    return null;
  }
  return (
    <>
      {entryPrice != null ? (
        <Typography.Text type="secondary" size="xSmall">
          Полная цена входа: {entryPrice}. Оставьте пустым для полной цены или укажите
          фактическую сумму (0–{entryPrice}).
        </Typography.Text>
      ) : (
        <Typography.Text type="secondary" size="xSmall">
          Оставьте пустым — возьмётся цена из турнира; иначе укажите фактически взятые
          деньги.
        </Typography.Text>
      )}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        placeholder={entryPrice != null ? String(entryPrice) : "Сумма оплаты"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: "100%",
          borderRadius: 12,
          border: "1px solid var(--border-color)",
          minHeight: 44,
          padding: "0 12px",
          backgroundColor: "var(--background-primary)",
          color: "var(--text-primary)",
        }}
      />
    </>
  );
};

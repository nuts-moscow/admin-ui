import { PaymentMethod } from "./InGamePlayerState";

/** Для POST game-start / in-game-payment: не передавать поле = полная цена с сервера. */
export function parseEntryPaidAmountForApi(
  entryPrice: number | undefined,
  input: string,
  method: PaymentMethod,
):
  | { ok: true; entryPaidAmount?: number }
  | { ok: false; message: string } {
  if (method === "Free") {
    return { ok: true, entryPaidAmount: undefined };
  }
  const trimmed = input.trim();
  if (trimmed === "") {
    return { ok: true, entryPaidAmount: undefined };
  }
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 0) {
    return {
      ok: false,
      message: "Сумма входа: введите целое число ≥ 0",
    };
  }
  if (entryPrice != null && n > entryPrice) {
    return {
      ok: false,
      message: `Сумма не больше полной цены входа (${entryPrice})`,
    };
  }
  if (entryPrice != null && n === entryPrice) {
    return { ok: true, entryPaidAmount: undefined };
  }
  return { ok: true, entryPaidAmount: n };
}

/**
 * Для POST reentry-payment: undefined = не слать paidAmounts (все ребаи по ценам турнира).
 * Иначе массив той же длины, что payments (Free → 0).
 */
export function buildReentryPaidAmountsForApi(
  methods: PaymentMethod[],
  inputs: string[],
  reentryPrice: number | undefined,
):
  | { ok: true; paidAmounts?: number[] }
  | { ok: false; message: string } {
  if (methods.length === 0) {
    return { ok: true, paidAmounts: undefined };
  }
  let needsExplicit = false;
  for (let i = 0; i < methods.length; i++) {
    if (methods[i] === "Free") {
      continue;
    }
    const t = (inputs[i] ?? "").trim();
    if (t === "") {
      continue;
    }
    const v = Number.parseInt(t, 10);
    if (!Number.isFinite(v) || v < 0) {
      return {
        ok: false,
        message: `Ребай ${i + 1}: некорректная сумма`,
      };
    }
    if (reentryPrice != null && v > reentryPrice) {
      return {
        ok: false,
        message: `Ребай ${i + 1}: не больше полной цены (${reentryPrice})`,
      };
    }
    if (reentryPrice == null || v !== reentryPrice) {
      needsExplicit = true;
    }
  }
  if (!needsExplicit) {
    return { ok: true, paidAmounts: undefined };
  }
  const out: number[] = [];
  for (let i = 0; i < methods.length; i++) {
    if (methods[i] === "Free") {
      out.push(0);
      continue;
    }
    const t = (inputs[i] ?? "").trim();
    if (t === "") {
      if (reentryPrice == null) {
        return {
          ok: false,
          message: `Ребай ${i + 1}: для скидочных сумм нужна полная цена ребая в структуре турнира (reentry_price) или введите сумму вручную`,
        };
      }
      out.push(reentryPrice);
    } else {
      out.push(Number.parseInt(t, 10));
    }
  }
  if (out.length !== methods.length) {
    return { ok: false, message: "Внутренняя ошибка: длина paidAmounts" };
  }
  return { ok: true, paidAmounts: out };
}

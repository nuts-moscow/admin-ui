/** Разбор тела ошибки API, в т.ч. `{ "error": "..." }`. */
export function formatApiErrorForUser(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Неизвестная ошибка";
  }
  const message = error.message.trim();
  if (!message) {
    return "Ошибка запроса";
  }
  try {
    const parsed = JSON.parse(message) as { error?: string };
    if (typeof parsed?.error === "string" && parsed.error.trim()) {
      return parsed.error.trim();
    }
  } catch {
    // не JSON — оставляем текст как есть (часто plain text от бэка)
  }
  return message;
}

const ERROR_CODE_HINTS: Readonly<Record<string, string>> = {
  paid_entry_not_allowed:
    "Платный вход недоступен: для турнира задан режим «только бесплатный бай-ин». Используйте способ Free.",
};

/** Разбор тела ошибки API, в т.ч. `{ "error": "...", "code": "..." }`. */
export function formatApiErrorForUser(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Неизвестная ошибка";
  }
  const message = error.message.trim();
  if (!message) {
    return "Ошибка запроса";
  }
  try {
    const parsed = JSON.parse(message) as { error?: string; code?: string };
    const serverError =
      typeof parsed?.error === "string" ? parsed.error.trim() : "";
    const code =
      typeof parsed?.code === "string" ? parsed.code.trim() : "";
    const hint = code ? ERROR_CODE_HINTS[code] : undefined;
    if (hint) {
      return serverError ? `${hint} (${serverError})` : hint;
    }
    if (serverError) {
      return code ? `${serverError} [${code}]` : serverError;
    }
  } catch {
    // не JSON — оставляем текст как есть (часто plain text от бэка)
  }
  return message;
}

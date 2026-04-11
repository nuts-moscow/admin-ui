export type ChangePasswordResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };

export const changePassword = async (
  apiUrl: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> => {
  const response = await fetch(`${apiUrl}/v2/api/auth/change-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (response.status === 204) {
    return { ok: true };
  }

  if (response.status === 400) {
    try {
      const data = (await response.json()) as { error: string };
      return { ok: false, error: data.error || "Ошибка валидации" };
    } catch {
      return { ok: false, error: "Ошибка валидации" };
    }
  }

  return { ok: false, error: "Неизвестная ошибка" };
};

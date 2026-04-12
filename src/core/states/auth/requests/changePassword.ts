import { clearAuthToken, getAuthToken } from "../authTokenStorage";

export type ChangePasswordResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };

export const changePassword = async (
  apiUrl: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> => {
  const token = getAuthToken();
  if (!token) {
    return { ok: false, error: "Сессия истекла" };
  }
  const response = await fetch(`${apiUrl}/v2/api/auth/change-password`, {
    method: "POST",
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (response.status === 204) {
    clearAuthToken();
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
    return { ok: true };
  }

  if (response.status === 401) {
    clearAuthToken();
    try {
      const data = (await response.json()) as { error?: string };
      return {
        ok: false,
        error: data.error || "Сессия истекла",
      };
    } catch {
      return { ok: false, error: "Сессия истекла" };
    }
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

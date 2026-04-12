import { setAuthToken } from "../authTokenStorage";

export type LoginResult =
  | { readonly ok: true; readonly username: string }
  | { readonly ok: false; readonly reason: "invalid_credentials" | "rate_limited" };

export const login = async (
  apiUrl: string,
  username: string,
  password: string,
): Promise<LoginResult> => {
  const response = await fetch(`${apiUrl}/v2/api/auth/login`, {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = (await response.json()) as { username: string; token: string };
    if (data.token) {
      setAuthToken(data.token);
    }
    return { ok: true, username: data.username };
  }
  if (response.status === 429) {
    return { ok: false, reason: "rate_limited" };
  }
  return { ok: false, reason: "invalid_credentials" };
};

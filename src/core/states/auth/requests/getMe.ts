import { AuthUser } from "../authTypes";
import { clearAuthToken, getAuthToken } from "../authTokenStorage";

export const getMe = async (apiUrl: string): Promise<AuthUser | null> => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }
  try {
    const response = await fetch(`${apiUrl}/v2/api/auth/me`, {
      credentials: "omit",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) {
      clearAuthToken();
      return null;
    }
    if (response.ok) {
      return response.json() as Promise<AuthUser>;
    }
    return null;
  } catch {
    return null;
  }
};

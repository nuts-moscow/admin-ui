import { clearAuthToken, getAuthToken } from "../authTokenStorage";

export const logout = async (apiUrl: string): Promise<void> => {
  const token = getAuthToken();
  try {
    if (token) {
      await fetch(`${apiUrl}/v2/api/auth/logout`, {
        method: "POST",
        credentials: "omit",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // Ignore network errors on logout
  } finally {
    clearAuthToken();
  }
};

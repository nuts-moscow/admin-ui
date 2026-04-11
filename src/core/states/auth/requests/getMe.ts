import { AuthUser } from "../authTypes";

export const getMe = async (apiUrl: string): Promise<AuthUser | null> => {
  try {
    const response = await fetch(`${apiUrl}/v2/api/auth/me`, {
      credentials: "include",
    });
    if (response.ok) {
      return response.json() as Promise<AuthUser>;
    }
    return null;
  } catch {
    return null;
  }
};

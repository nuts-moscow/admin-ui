export const logout = async (apiUrl: string): Promise<void> => {
  try {
    await fetch(`${apiUrl}/v2/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore network errors on logout
  }
};

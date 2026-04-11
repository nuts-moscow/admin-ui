export interface AuthUser {
  readonly id: number;
  readonly username: string;
}

export interface AuthState {
  readonly user: AuthUser | null;
  readonly status: "loading" | "authenticated" | "unauthenticated";
}

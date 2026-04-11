"use client";
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { WithChildren } from "@/core/utils/style/WithChildren";
import { useEnvironment } from "@/core/states/environment/useEnvironment";
import { AuthState, AuthUser } from "./authTypes";
import { getMe } from "./requests/getMe";
import { logout as logoutRequest } from "./requests/logout";
import { registerUnauthorizedHandler } from "@/core/utils/misc/authInterceptor";

interface AuthContextValue extends AuthState {
  readonly logout: () => Promise<void>;
  readonly refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  status: "loading",
  logout: async () => {},
  refreshUser: async () => null,
});

export const AuthProvider: FC<WithChildren> = ({ children }) => {
  const environment = useEnvironment();
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    status: "loading",
  });

  const handleUnauthorized = useCallback(() => {
    setState({ user: null, status: "unauthenticated" });
    router.push("/login");
  }, [router]);

  useEffect(() => {
    return registerUnauthorizedHandler(handleUnauthorized);
  }, [handleUnauthorized]);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    const user = await getMe(environment.apiUrl);
    setState({
      user,
      status: user ? "authenticated" : "unauthenticated",
    });
    return user;
  }, [environment.apiUrl]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await logoutRequest(environment.apiUrl);
    setState({ user: null, status: "unauthenticated" });
    router.push("/login");
  }, [environment.apiUrl, router]);

  return (
    <AuthContext.Provider value={{ ...state, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => useContext(AuthContext);

"use client";
import { FC, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { WithChildren } from "@/core/utils/style/WithChildren";
import { useAuth } from "@/core/states/auth/useAuth";
import { Box } from "@/components/Box/Box";
import { Loader2 } from "lucide-react";

const PUBLIC_PATHS = ["/login", "/tournament-clock-list"];

const isPublicPathname = (pathname: string): boolean => {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }
  // Tournament display pages are public — intended for TV/projector without auth
  if (/^\/tournament\/[^/]+\/display(\/.*)?$/.test(pathname)) {
    return true;
  }
  return false;
};

export const AuthGuard: FC<WithChildren> = ({ children }) => {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") return;
    if (isPublicPathname(pathname)) return;
    router.replace("/login");
  }, [status, pathname, router]);

  if (status === "loading") {
    return (
      <Box
        style={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          justifyContent: "center",
          minHeight: "40vh",
        }}
      >
        <Loader2 className="animate-spin" size={32} />
      </Box>
    );
  }

  if (status === "unauthenticated" && !isPublicPathname(pathname)) {
    return (
      <Box
        style={{
          alignItems: "center",
          display: "flex",
          flex: 1,
          justifyContent: "center",
          minHeight: "40vh",
        }}
      >
        <Loader2 className="animate-spin" size={32} />
      </Box>
    );
  }

  return <>{children}</>;
};

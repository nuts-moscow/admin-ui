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

  const isPublicPath = isPublicPathname(pathname);

  useEffect(() => {
    if (status === "unauthenticated" && !isPublicPath) {
      router.push("/login");
    }
  }, [status, isPublicPath, router]);

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <Box
        flex={{ align: "center", justify: "center" }}
        style={{ minHeight: "100vh" }}
      >
        <Loader2
          size={32}
          style={{
            animation: "spin 1s linear infinite",
            color: "var(--text-primary)",
          }}
        />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </Box>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
};

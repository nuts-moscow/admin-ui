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

// AUTH DISABLED TEMPORARILY
export const AuthGuard: FC<WithChildren> = ({ children }) => {
  return <>{children}</>;
};

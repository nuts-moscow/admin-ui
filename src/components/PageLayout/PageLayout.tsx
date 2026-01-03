"use client";

import { FC, ReactNode } from "react";
import { Box } from "@/components/Box/Box";

export interface PageLayoutProps {
  readonly children: ReactNode;
}

export const PageLayout: FC<PageLayoutProps> = ({ children }) => {
  return (
    <Box
      flex={{ col: true, width: "100%" }}
      padding={[8, 2]}
      style={{ maxWidth: 1400, margin: "0 auto" }}
    >
      {children}
    </Box>
  );
};

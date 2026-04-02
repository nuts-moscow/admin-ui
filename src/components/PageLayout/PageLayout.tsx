"use client";

import { FC, ReactNode } from "react";
import { Box } from "@/components/Box/Box";

export interface PageLayoutProps {
  readonly children: ReactNode;
  /** Растягивать блок на оставшуюся высоту под шапкой (колонка турнира и т.п.). */
  readonly fillRemainingViewport?: boolean;
}

export const PageLayout: FC<PageLayoutProps> = ({
  children,
  fillRemainingViewport = false,
}) => {
  return (
    <Box
      flex={{ col: true, width: "100%" }}
      flexItem={
        fillRemainingViewport
          ? { flex: 1, minHeight: 0, alignSelf: "stretch" }
          : undefined
      }
      padding={[8, 2]}
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        ...(fillRemainingViewport ? { minHeight: 0 } : {}),
      }}
    >
      {children}
    </Box>
  );
};

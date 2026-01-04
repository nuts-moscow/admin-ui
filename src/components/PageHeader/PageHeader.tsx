"use client";

import { FC, ReactNode } from "react";
import Image from "next/image";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";
import { pageHeaderCls } from "@/components/PageHeader/PageHeader.css";

export interface PageHeaderProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly extra?: ReactNode;
  readonly showLogo?: boolean;
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  extra,
  showLogo = true,
}) => {
  return (
    <Box
      flex={{ gap: 4, align: "center" }}
      padding={4}
      className={pageHeaderCls}
      style={{ width: "100%", minHeight: "auto" }}
    >
      {showLogo && (
        <Image
          src="/nuts-logo.svg"
          alt="NUTS FAMILY Logo"
          width={48}
          height={48}
          priority
        />
      )}

      {(title || subtitle) && (
        <Box flex={{ col: true, gap: 0 }}>
          {title && (
            <Typography.Text
              size="large"
              style={{ margin: 0, lineHeight: 1, fontWeight: 600 }}
            >
              {title}
            </Typography.Text>
          )}
          {subtitle && (
            <Typography.Text
              type="secondary"
              size="small"
              style={{ lineHeight: 1 }}
            >
              {subtitle}
            </Typography.Text>
          )}
        </Box>
      )}

      {extra && <div style={{ marginLeft: "auto" }}>{extra}</div>}
    </Box>
  );
};

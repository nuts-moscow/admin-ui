"use client";

import Image from "next/image";
import { Box } from "@/components/Box/Box";
import { Typography } from "@/components/Typography/Typography";
import { Button } from "@/components/Button/Button";
import { Tag } from "@/components/Tag/Tag";

export const HomePageView = () => {
  return (
    <Box
      flex={{ col: true, align: "center", justify: "center" }}
      style={{ minHeight: "100vh" }}
      padding={8}
    >
      <Box flexItem={{ marginBottom: 12 }}>
        <Image
          src="/nuts-logo.svg"
          alt="NUTS FAMILY Logo"
          width={200}
          height={80}
          priority
        />
      </Box>

      <Typography.Title level={2} style={{ marginBottom: "1rem" }}>
        Admin Panel
      </Typography.Title>

      <Typography.Text type="secondary" style={{ marginBottom: "3rem" }}>
        Black & White Design System
      </Typography.Text>

      <Box
        flex={{ gap: 16, flexWrap: "wrap", justify: "center", maxWidth: 800 }}
      >
        <Box border padding={8} borderRadius="xl" minWidth={250}>
          <Typography.Title level={4} style={{ marginBottom: "1rem" }}>
            Components
          </Typography.Title>
          <Box flex={{ col: true, gap: 12 }}>
            <Button type="primary">Primary Button</Button>
            <Button type="secondary">Secondary Button</Button>
            <Button type="outline">Outline Button</Button>
          </Box>
        </Box>

        <Box border padding={8} borderRadius="xl" minWidth={250}>
          <Typography.Title level={4} style={{ marginBottom: "1rem" }}>
            Tags
          </Typography.Title>
          <Box flex={{ gap: 8, flexWrap: "wrap" }}>
            <Tag type="success">Success</Tag>
            <Tag type="warning">Warning</Tag>
          </Box>
        </Box>

        <Box border padding={8} borderRadius="xl" minWidth={250}>
          <Typography.Title level={4} style={{ marginBottom: "1rem" }}>
            Typography
          </Typography.Title>
          <Box flex={{ col: true, gap: 8 }}>
            <Typography.Text size="large">Large Text</Typography.Text>
            <Typography.Text size="medium">Medium Text</Typography.Text>
            <Typography.Text size="small">Small Text</Typography.Text>
          </Box>
        </Box>
      </Box>

      <Box flexItem={{ marginTop: 12 }}>
        <Typography.Text size="small" type="grey">
          Built with Next.js, TypeScript & vanilla-extract
        </Typography.Text>
      </Box>
    </Box>
  );
};

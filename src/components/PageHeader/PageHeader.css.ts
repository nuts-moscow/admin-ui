import { style } from "@vanilla-extract/css";

const headerSidePadding = `calc(var(--base-gutter) * 4)`;

export const pageHeaderCls = style({
  backgroundColor: "var(--background-primary)",
  borderBottom: "1px solid var(--border-color)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  display: "flex",
  alignItems: "center",
  position: "sticky",
  top: 0,
  zIndex: 200,
  isolation: "isolate",
  /*
   * Верх: safe-area (вырезы, PWA) + --browser-chrome-top-gap (ТВ / WebView с полоской UI),
   * плюс тот же боковой отступ, что был у padding={4} в Box.
   */
  padding: `calc(env(safe-area-inset-top, 0px) + var(--browser-chrome-top-gap, 0px) + ${headerSidePadding}) ${headerSidePadding} ${headerSidePadding}`,
});

export const pageHeaderContentCls = style({
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

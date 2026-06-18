import { globalStyle, style } from "@vanilla-extract/css";
import { getGutter } from "@/core/utils/style/gutter";

/** Внешняя оболочка мобильного экрана: вся высота, фон, скролл документа. */
export const mobileShellCls = style({
  display: "flex",
  flexDirection: "column",
  minHeight: "100dvh",
  width: "100%",
  backgroundColor: "var(--background-primary)",
  color: "var(--text-primary)",
});

/** Прилипающая шапка с safe-area сверху. */
export const mobileHeaderCls = style({
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "flex",
  alignItems: "center",
  gap: getGutter(2),
  minHeight: 52,
  padding: getGutter([2, 3]),
  paddingTop: `calc(${getGutter(2)} + env(safe-area-inset-top, 0px))`,
  backgroundColor: "var(--background-primary)",
  borderBottom: "1px solid var(--border-color-table)",
});

export const mobileHeaderTitleCls = style({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

/** Скроллируемая область контента с боковыми отступами и safe-area снизу. */
export const mobileContentCls = style({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: getGutter(3),
  padding: getGutter(3),
  paddingBottom: `calc(${getGutter(6)} + env(safe-area-inset-bottom, 0px))`,
});

/** Горизонтально-скроллируемые чипы разделов. */
export const sectionTabsCls = style({
  display: "flex",
  gap: getGutter(2),
  overflowX: "auto",
  padding: getGutter([2, 3]),
  scrollbarWidth: "none",
  borderBottom: "1px solid var(--border-color-table)",
});
globalStyle(`${sectionTabsCls}::-webkit-scrollbar`, { display: "none" });

export const sectionTabCls = style({
  flex: "0 0 auto",
  minHeight: 38,
  padding: getGutter([1.5, 3]),
  borderRadius: 999,
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--background-primary)",
  color: "var(--text-primary)",
  whiteSpace: "nowrap",
  cursor: "pointer",
  fontSize: "var(--font-size-small)",
  fontFamily: "var(--primary-font-family)",
});

export const sectionTabActiveCls = style({
  backgroundColor: "var(--color-primary)",
  color: "var(--background-primary)",
});

/** Полноширинный текстовый/числовой инпут под палец. */
export const mobileInputCls = style({
  width: "100%",
  minHeight: 44,
  borderRadius: 12,
  border: "1px solid var(--border-color)",
  padding: "0 12px",
  backgroundColor: "var(--background-primary)",
  color: "var(--text-primary)",
  fontSize: "var(--font-size-small)",
  fontFamily: "var(--primary-font-family)",
});

/** Карточка списка (турнир, игрок, стол…). */
export const mobileCardCls = style({
  display: "flex",
  flexDirection: "column",
  gap: getGutter(1),
  padding: getGutter(3),
  borderRadius: 14,
  border: "1px solid var(--border-color-table)",
  backgroundColor: "var(--background-primary)",
});

/** Ссылка-обёртка для карточки: блок во всю ширину, без подчёркивания. */
export const mobileCardLinkCls = style({
  display: "block",
  width: "100%",
  textDecoration: "none",
  color: "inherit",
});

/* ---- Bottom sheet ---- */
export const sheetOverlayCls = style({
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
});

export const sheetPanelCls = style({
  width: "100%",
  maxWidth: 560,
  maxHeight: "min(92dvh, 920px)",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--background-primary)",
  color: "var(--text-primary)",
  borderTopLeftRadius: 18,
  borderTopRightRadius: 18,
  borderTop: "1px solid var(--border-color)",
  boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.18)",
});

export const sheetHeaderCls = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: getGutter(2),
  padding: getGutter([3, 3]),
  borderBottom: "1px solid var(--border-color-table)",
});

export const sheetBodyCls = style({
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: getGutter(3),
  padding: getGutter(3),
  paddingBottom: `calc(${getGutter(3)} + env(safe-area-inset-bottom, 0px))`,
});

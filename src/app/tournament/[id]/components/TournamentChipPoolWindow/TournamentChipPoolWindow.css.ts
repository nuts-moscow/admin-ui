import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";
import { getGutter } from "@/core/utils/style/gutter";
import {
  CHIP_POOL_INK,
  CHIP_POOL_INK_MUTED,
  CHIP_POOL_INK_SOFT,
} from "./chipPoolTokens";

/** Общий левый сдвиг для лого и колонки статов (шире под эфир). */
const chipPoolLeftContentInset = "clamp(24px, 6vw, 88px)";

/** SVG grain (feTurbulence) — лёгкая «бумажная» фактура поверх градиента. */
const grainSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'><filter id='g' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#g)' opacity='0.4'/></svg>`,
);

export type ChipPoolWindowLayout = "admin" | "broadcast";

/**
 * Тёплый песочно-кремовый mesh (персик, карамель, тауп) + зерно.
 * Для эфира на ТВ (`broadcast`) — меньше верхнего поля; без flex-grow оболочка не тянет контент на всю высоту экрана.
 */
export const chipPoolShellCls = recipe({
  base: {
    width: "100%",
    flex: 1,
    minHeight: 0,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--primary-font-family)",
    paddingRight: getGutter(4),
    paddingBottom: getGutter(2),
    paddingLeft: getGutter(4),
    position: "relative",
    isolation: "isolate",
    backgroundColor: "#d9c4ae",
    backgroundImage: `
    url("data:image/svg+xml,${grainSvg}"),
    radial-gradient(ellipse 95% 85% at 88% 12%, rgba(252, 195, 158, 0.9) 0%, transparent 44%),
    radial-gradient(ellipse 80% 70% at 10% 48%, rgba(238, 200, 168, 0.85) 0%, transparent 41%),
    radial-gradient(ellipse 110% 60% at 50% 102%, rgba(165, 130, 105, 0.62) 0%, transparent 38%),
    radial-gradient(circle at 72% 58%, rgba(200, 168, 140, 0.58) 0%, transparent 32%),
    radial-gradient(ellipse 70% 45% at 22% 18%, rgba(242, 220, 198, 0.92) 0%, transparent 36%),
    radial-gradient(ellipse 72% 58% at 8% 82%, rgba(175, 140, 108, 0.58) 0%, transparent 48%),
    radial-gradient(ellipse 68% 52% at 94% 32%, rgba(198, 162, 128, 0.56) 0%, transparent 44%),
    radial-gradient(ellipse 88% 65% at 52% 48%, rgba(210, 180, 150, 0.4) 0%, transparent 54%),
    linear-gradient(168deg, #f8efe4 0%, #e2d0bc 28%, #c9b092 58%, #ae9578 100%)
  `,
    backgroundSize:
      "180px 180px, auto, auto, auto, auto, auto, auto, auto, auto, auto",
    backgroundRepeat:
      "repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat",
    backgroundBlendMode:
      "soft-light, normal, normal, normal, normal, normal, normal, normal, normal, normal",
    color: CHIP_POOL_INK,
  },
  variants: {
    layout: {
      admin: {
        paddingTop: "clamp(40px, 7vh, 88px)",
      },
      broadcast: {
        paddingTop: "clamp(12px, 2vh, 36px)",
        flex: "none",
        minHeight: "auto",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolHeaderGridCls = style({
  display: "grid",
  /** minmax(0,1fr) — длинное название турнира переносится, а не обрезается по краю колонки. */
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
  alignItems: "center",
  gap: getGutter(2),
  width: "100%",
  minHeight: 56,
  /** Отступ до полосы правил задаётся у subheader (симметрия с блоком уровня). */
  marginBottom: 0,
});

export const chipPoolHeaderSideCls = style({
  minHeight: 40,
  minWidth: 0,
});

export const chipPoolHeaderLogoWrapCls = style({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  minHeight: 40,
  minWidth: 0,
  paddingLeft: chipPoolLeftContentInset,
});

export const chipPoolHeaderLogoImgCls = style({
  height: "clamp(60px, 11vw, 104px)",
  width: "auto",
  objectFit: "contain",
  /** Белый фон растра «вычитается»: тёмные элементы лого остаются на песочном градиенте. */
  mixBlendMode: "multiply",
});

/** Строка заголовка: название турнира по центру. */
export const chipPoolTitleRowCls = style({
  margin: 0,
  minWidth: 0,
  maxWidth: "100%",
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  justifyContent: "center",
  columnGap: "clamp(14px, 2.8vw, 32px)",
  rowGap: "0.35em",
  textAlign: "center",
  color: CHIP_POOL_INK,
});

export const chipPoolTitleNameCls = style({
  fontFamily: "var(--display-font-family)",
  fontSize: "clamp(1.25rem, 3.2vw, 2.35rem)",
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  lineHeight: 1.15,
  overflowWrap: "anywhere",
});

/** Полоса правил — по вертикали между шапкой (лого/название) и блоком уровня/часов. */
export const chipPoolSubHeaderCls = recipe({
  base: {
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
    fontFamily: "var(--primary-font-family)",
    fontSize: "clamp(0.75rem, 1.35vw, 0.95rem)",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: CHIP_POOL_INK_MUTED,
    padding: `${getGutter(4)} ${getGutter(3)}`,
    borderRadius: "clamp(12px, 1.5vw, 18px)",
    border: "1px solid rgba(120, 100, 85, 0.14)",
    backgroundColor: "rgba(218, 208, 195, 0.5)",
  },
  variants: {
    layout: {
      admin: {
        marginTop: getGutter(6),
        marginBottom: getGutter(2),
      },
      broadcast: {
        marginTop: getGutter(2),
        marginBottom: getGutter(1),
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolMainGridCls = recipe({
  base: {
    display: "grid",
    /**
     * 1fr | auto | 1fr — средняя колонка (часы) по горизонтали по центру экрана,
     * боковые поля одинаковой ширины; статы слева в своей половине.
     */
    gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
    gap: getGutter(4),
    width: "100%",
    minHeight: 0,
  },
  variants: {
    layout: {
      /**
       * Во вкладке админки сетка забирает остаток высоты — часы визуально по центру панели.
       */
      admin: {
        alignItems: "stretch",
        alignContent: "stretch",
        flex: 1,
      },
      /**
       * На ТВ не растягиваем сетку на весь viewport — иначе между подзаголовком и контентом «висит» пустота.
       */
      broadcast: {
        alignItems: "start",
        alignContent: "start",
        flex: "none",
        flexShrink: 0,
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolLeftColumnCls = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    minWidth: 0,
    justifySelf: "start",
    maxWidth: "100%",
    /** Сдвиг контента от левого края к центру экрана (симметрия с пустой правой колонкой). */
    paddingLeft: chipPoolLeftContentInset,
  },
  variants: {
    layout: {
      admin: {
        justifyContent: "center",
      },
      broadcast: {
        justifyContent: "flex-start",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolStatStackCls = style({
  display: "flex",
  flexDirection: "column",
  gap: getGutter(5),
});

export const chipPoolStatLabelCls = style({
  fontSize: "clamp(0.85rem, 1.45vw, 1.05rem)",
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: CHIP_POOL_INK_SOFT,
  marginBottom: 6,
});

export const chipPoolStatValueCls = style({
  fontSize: "clamp(1.85rem, 3.4vw, 3.1rem)",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
  color: CHIP_POOL_INK,
  lineHeight: 1.2,
});

export const chipPoolCenterColumnCls = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifySelf: "center",
    width: "fit-content",
    maxWidth: "min(100%, 92vw)",
    minWidth: 0,
    textAlign: "center",
  },
  variants: {
    layout: {
      admin: {
        justifyContent: "center",
      },
      broadcast: {
        justifyContent: "flex-start",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolRightSpacerCls = style({
  minWidth: 0,
  minHeight: 1,
  justifySelf: "stretch",
  // симметрия с левым 1fr — контента нет
});

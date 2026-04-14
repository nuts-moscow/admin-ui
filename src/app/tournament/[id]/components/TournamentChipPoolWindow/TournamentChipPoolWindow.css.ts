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
 * Для эфира (`broadcast`) — меньше верхнего поля; оболочка flex:1 заполняет display-shell,
 * чтобы градиент тянулся на весь экран и не просвечивал белый фон body.
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
        paddingTop: `calc(env(safe-area-inset-top, 0px) + var(--browser-chrome-top-gap, 0px) + clamp(12px, 2vh, 36px))`,
        flex: 1,
        minHeight: 0,
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

export const chipPoolHeaderLogoWrapCls = recipe({
  base: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    minHeight: 40,
    minWidth: 0,
  },
  variants: {
    layout: {
      admin: {
        paddingLeft: chipPoolLeftContentInset,
      },
      broadcast: {
        paddingLeft: "clamp(12px, 2.5vw, 40px)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolHeaderLogoImgCls = recipe({
  base: {
    width: "auto",
    objectFit: "contain",
    /** Белый фон растра «вычитается»: тёмные элементы лого остаются на песочном градиенте. */
    mixBlendMode: "multiply",
  },
  variants: {
    layout: {
      admin: {
        height: "clamp(60px, 11vw, 104px)",
      },
      broadcast: {
        height: "var(--chip-broadcast-logo-height)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
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

export const chipPoolTitleNameCls = recipe({
  base: {
    fontFamily: "var(--display-font-family)",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    lineHeight: 1.15,
    overflowWrap: "anywhere",
  },
  variants: {
    layout: {
      admin: {
        fontSize: "clamp(1.25rem, 3.2vw, 2.35rem)",
      },
      broadcast: {
        fontSize: "var(--chip-broadcast-title-size)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
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
        fontSize: "var(--chip-broadcast-subheader-font)",
        padding: `${getGutter(3)} ${getGutter(3)}`,
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
    /**
     * Иначе единственная строка auto — по высоте контента, а область грида flex:1
     * остаётся пустой снизу (типичный баг на /display).
     */
    gridTemplateRows: "minmax(0, 1fr)",
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
       * Эфир: сетка flex:1; выравнивание колонок задаётся CSS-переменными (ноутбук start / ТВ stretch).
       */
      broadcast: {
        alignItems: "var(--chip-broadcast-grid-align-items)",
        alignContent: "var(--chip-broadcast-grid-align-content)",
        flex: 1,
        minHeight: 0,
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
        justifyContent: "var(--chip-broadcast-column-justify)",
        alignSelf: "stretch",
        paddingLeft: "clamp(12px, 2.5vw, 40px)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolStatStackCls = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
  },
  variants: {
    layout: {
      admin: {
        gap: getGutter(5),
      },
      broadcast: {
        gap: "var(--chip-broadcast-stat-gap)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolStatLabelCls = recipe({
  base: {
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: CHIP_POOL_INK_SOFT,
    marginBottom: 6,
  },
  variants: {
    layout: {
      admin: {
        fontSize: "clamp(0.85rem, 1.45vw, 1.05rem)",
      },
      broadcast: {
        fontSize: "var(--chip-broadcast-stat-label-size)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolStatValueCls = recipe({
  base: {
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    color: CHIP_POOL_INK,
    lineHeight: 1.2,
  },
  variants: {
    layout: {
      admin: {
        fontSize: "clamp(1.85rem, 3.4vw, 3.1rem)",
      },
      broadcast: {
        fontSize: "var(--chip-broadcast-stat-value-size)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
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
        justifyContent: "var(--chip-broadcast-column-justify)",
        alignSelf: "stretch",
        width: "100%",
        minHeight: 0,
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

/** Правая колонка — предпросмотр рейтинговых баллов (публичное окно). */
export const chipPoolRightColumnCls = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    minWidth: 0,
    justifySelf: "end",
    maxWidth: "100%",
    textAlign: "right",
    paddingRight: chipPoolLeftContentInset,
  },
  variants: {
    layout: {
      admin: {
        justifyContent: "center",
      },
      broadcast: {
        /**
         * Сдвиг вниз, чтобы «Рейтинговая зона» совпадала по вертикали с «Игроки»
         * при space-evenly слева (см. --chip-broadcast-rating-zone-padding-top в globals / display-shell).
         */
        justifyContent: "flex-start",
        alignSelf: "stretch",
        paddingRight: "clamp(12px, 2.5vw, 40px)",
        paddingTop: "var(--chip-broadcast-rating-zone-padding-top, 0px)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

/** Заголовок блока баллов — те же метрики, что у chipPoolStatLabelCls («Игроки» и т.д.). */
export const chipPoolRatingTitleCls = recipe({
  base: {
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: CHIP_POOL_INK_SOFT,
    marginBottom: 4,
    lineHeight: 1.2,
  },
  variants: {
    layout: {
      admin: {
        fontSize: "clamp(0.75rem, 1.2vw, 0.9rem)",
      },
      broadcast: {
        fontSize: "var(--chip-broadcast-stat-label-size)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolRatingTableCls = recipe({
  base: {
    width: "100%",
    maxWidth: "min(100%, 22rem)",
    borderCollapse: "collapse",
    fontVariantNumeric: "tabular-nums",
  },
  variants: {
    layout: {
      admin: {
        marginTop: 0,
      },
      broadcast: {
        /** Отступ сверху от заголовка «Рейтинговая зона», не margin-bottom у заголовка. */
        marginTop: "clamp(8px, 1.4vh, 18px)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolRatingThCls = recipe({
  base: {
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: CHIP_POOL_INK_SOFT,
    paddingBottom: 4,
    paddingTop: 0,
    lineHeight: 1.15,
    textAlign: "inherit",
  },
  variants: {
    layout: {
      admin: {
        fontSize: "clamp(0.7rem, 1.1vw, 0.82rem)",
      },
      broadcast: {
        fontSize: "clamp(0.65rem, min(1.1vw, 1.8vh), 0.88rem)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

export const chipPoolRatingTdCls = recipe({
  base: {
    fontWeight: 700,
    color: CHIP_POOL_INK,
    paddingTop: 2,
    paddingBottom: 2,
    lineHeight: 1.12,
    borderTop: "1px solid rgba(120, 100, 85, 0.12)",
    textAlign: "inherit",
  },
  variants: {
    layout: {
      admin: {
        fontSize: "clamp(1rem, 1.8vw, 1.35rem)",
      },
      broadcast: {
        fontSize: "clamp(0.88rem, min(1.55vw, 2.35vh), 1.35rem)",
      },
    },
  },
  defaultVariants: {
    layout: "admin",
  },
});

/** Разделитель между топ-10 и нижними местами в таблице баллов. */
export const chipPoolRatingEllipsisCellCls = style({
  textAlign: "center",
  color: CHIP_POOL_INK_SOFT,
  fontWeight: 600,
  letterSpacing: "0.4em",
  paddingTop: 3,
  paddingBottom: 3,
  lineHeight: 1,
  borderTop: "1px solid rgba(120, 100, 85, 0.12)",
  fontSize: "clamp(0.75rem, min(1.25vw, 1.6vh), 1rem)",
});

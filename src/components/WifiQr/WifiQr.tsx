import { CSSProperties, FC } from "react";

/**
 * Wi-Fi QR (SSID «Imperiya Dyma_5G»). Self-contained — no runtime QR
 * dependency; the module path is baked in. Styled as a small broadcast card
 * (paper, gold hairline, serif title) to sit on the TV clock page. Regenerate
 * the path if the network credentials change.
 */
const QR_PATH =
  "M0 0.5h7m1 0h7m3 0h2m1 0h1m4 0h7m-33 1h1m5 0h1m2 0h4m5 0h1m1 0h1m1 0h1m1 0h1m1 0h1m5 0h1m-33 1h1m1 0h3m1 0h1m2 0h1m1 0h5m2 0h1m2 0h1m1 0h2m1 0h1m1 0h3m1 0h1m-33 1h1m1 0h3m1 0h1m2 0h5m1 0h1m2 0h1m3 0h3m1 0h1m1 0h3m1 0h1m-33 1h1m1 0h3m1 0h1m1 0h5m5 0h1m4 0h1m2 0h1m1 0h3m1 0h1m-33 1h1m5 0h1m1 0h1m1 0h2m1 0h2m3 0h1m1 0h2m4 0h1m5 0h1m-33 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-22 1h1m2 0h1m3 0h2m1 0h4m-24 1h7m1 0h1m9 0h1m2 0h1m4 0h2m3 0h1m-33 1h1m1 0h1m1 0h1m2 0h1m1 0h2m1 0h1m1 0h1m2 0h5m1 0h3m6 0h1m-33 1h1m5 0h2m1 0h1m1 0h3m3 0h1m2 0h2m5 0h5m-32 1h1m3 0h2m3 0h1m1 0h3m1 0h4m2 0h4m2 0h5m-32 1h1m1 0h1m1 0h3m3 0h1m3 0h2m3 0h2m1 0h1m7 0h3m-32 1h1m1 0h1m5 0h2m2 0h1m1 0h2m1 0h2m3 0h1m1 0h2m3 0h1m-29 1h1m1 0h1m1 0h3m2 0h2m1 0h4m2 0h3m1 0h2m2 0h4m-32 1h3m2 0h1m1 0h6m6 0h1m1 0h2m2 0h8m-33 1h3m1 0h4m2 0h1m3 0h2m1 0h4m1 0h1m2 0h1m2 0h4m-32 1h1m2 0h3m1 0h2m1 0h5m1 0h1m1 0h3m1 0h1m2 0h1m1 0h1m1 0h2m1 0h1m-32 1h3m2 0h1m2 0h1m2 0h1m1 0h1m1 0h2m2 0h3m3 0h2m3 0h1m-31 1h3m4 0h3m1 0h3m6 0h4m1 0h1m2 0h3m-32 1h3m3 0h1m2 0h1m1 0h1m1 0h1m1 0h2m2 0h2m1 0h2m1 0h1m2 0h1m1 0h1m1 0h1m-33 1h1m3 0h2m2 0h1m1 0h2m1 0h1m2 0h1m1 0h2m1 0h1m1 0h1m2 0h2m1 0h1m1 0h1m-32 1h1m1 0h1m1 0h3m2 0h1m1 0h2m2 0h1m4 0h2m6 0h2m1 0h1m-32 1h1m1 0h2m1 0h1m1 0h1m1 0h1m1 0h1m1 0h6m2 0h1m8 0h1m-31 1h1m3 0h3m1 0h1m1 0h2m3 0h1m1 0h1m1 0h1m2 0h1m1 0h6m1 0h2m-25 1h13m2 0h2m3 0h1m2 0h2m-33 1h7m1 0h1m1 0h1m3 0h1m6 0h1m1 0h2m1 0h1m1 0h4m-32 1h1m5 0h1m1 0h6m3 0h3m1 0h2m1 0h1m3 0h1m1 0h1m-31 1h1m1 0h3m1 0h1m1 0h1m1 0h2m1 0h3m4 0h1m1 0h1m1 0h6m1 0h1m-32 1h1m1 0h3m1 0h1m1 0h2m1 0h2m4 0h1m1 0h3m1 0h3m3 0h2m1 0h1m-33 1h1m1 0h3m1 0h1m1 0h2m1 0h1m1 0h1m1 0h1m1 0h1m3 0h2m1 0h1m4 0h2m-31 1h1m5 0h1m1 0h1m4 0h1m2 0h2m2 0h4m1 0h6m-31 1h7m2 0h4m1 0h1m1 0h1m2 0h2m1 0h3m1 0h3m1 0h2";

export interface WifiQrProps {
  readonly size?: number;
  readonly style?: CSSProperties;
}

const INK = "#2b2119";
const GOLD = "#b58a3c";

export const WifiQr: FC<WifiQrProps> = ({ size = 104, style }) => {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: size * 0.06,
        padding: `${size * 0.12}px ${size * 0.14}px`,
        borderRadius: 14,
        background: "#f5efe1",
        border: `1px solid ${GOLD}`,
        boxShadow: `0 6px 22px -10px rgba(43, 33, 25, 0.45), inset 0 0 0 3px rgba(245, 239, 225, 1), inset 0 0 0 4px ${GOLD}33`,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: "var(--display-font-family)",
          fontSize: size * 0.19,
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: INK,
          lineHeight: 1,
        }}
      >
        Wi-Fi
      </div>
      <svg
        width={size}
        height={size}
        viewBox="0 0 33 33"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        style={{ display: "block" }}
      >
        <path stroke={INK} d={QR_PATH} />
      </svg>
      <div
        style={{
          fontFamily: "var(--primary-font-family)",
          fontSize: size * 0.11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: `${INK}99`,
          lineHeight: 1,
        }}
      >
        Наведи камеру
      </div>
    </div>
  );
};

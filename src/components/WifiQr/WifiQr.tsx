import { CSSProperties, FC } from "react";

/**
 * Wi-Fi QR (SSID «Imperiya Dyma_5G»). Self-contained — no runtime QR
 * dependency; the module path is baked in. Rendered as the top-right pill from
 * the approved mockup: QR + network name + caption. Regenerate the path if the
 * network credentials change.
 */
const QR_PATH =
  "M0 0.5h7m1 0h7m3 0h2m1 0h1m4 0h7m-33 1h1m5 0h1m2 0h4m5 0h1m1 0h1m1 0h1m1 0h1m1 0h1m5 0h1m-33 1h1m1 0h3m1 0h1m2 0h1m1 0h5m2 0h1m2 0h1m1 0h2m1 0h1m1 0h3m1 0h1m-33 1h1m1 0h3m1 0h1m2 0h5m1 0h1m2 0h1m3 0h3m1 0h1m1 0h3m1 0h1m-33 1h1m1 0h3m1 0h1m1 0h5m5 0h1m4 0h1m2 0h1m1 0h3m1 0h1m-33 1h1m5 0h1m1 0h1m1 0h2m1 0h2m3 0h1m1 0h2m4 0h1m5 0h1m-33 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-22 1h1m2 0h1m3 0h2m1 0h4m-24 1h7m1 0h1m9 0h1m2 0h1m4 0h2m3 0h1m-33 1h1m1 0h1m1 0h1m2 0h1m1 0h2m1 0h1m1 0h1m2 0h5m1 0h3m6 0h1m-33 1h1m5 0h2m1 0h1m1 0h3m3 0h1m2 0h2m5 0h5m-32 1h1m3 0h2m3 0h1m1 0h3m1 0h4m2 0h4m2 0h5m-32 1h1m1 0h1m1 0h3m3 0h1m3 0h2m3 0h2m1 0h1m7 0h3m-32 1h1m1 0h1m5 0h2m2 0h1m1 0h2m1 0h2m3 0h1m1 0h2m3 0h1m-29 1h1m1 0h1m1 0h3m2 0h2m1 0h4m2 0h3m1 0h2m2 0h4m-32 1h3m2 0h1m1 0h6m6 0h1m1 0h2m2 0h8m-33 1h3m1 0h4m2 0h1m3 0h2m1 0h4m1 0h1m2 0h1m2 0h4m-32 1h1m2 0h3m1 0h2m1 0h5m1 0h1m1 0h3m1 0h1m2 0h1m1 0h1m1 0h2m1 0h1m-32 1h3m2 0h1m2 0h1m2 0h1m1 0h1m1 0h2m2 0h3m3 0h2m3 0h1m-31 1h3m4 0h3m1 0h3m6 0h4m1 0h1m2 0h3m-32 1h3m3 0h1m2 0h1m1 0h1m1 0h1m1 0h2m2 0h2m1 0h2m1 0h1m2 0h1m1 0h1m1 0h1m-33 1h1m3 0h2m2 0h1m1 0h2m1 0h1m2 0h1m1 0h2m1 0h1m1 0h1m2 0h2m1 0h1m1 0h1m-32 1h1m1 0h1m1 0h3m2 0h1m1 0h2m2 0h1m4 0h2m6 0h2m1 0h1m-32 1h1m1 0h2m1 0h1m1 0h1m1 0h1m1 0h1m1 0h6m2 0h1m8 0h1m-31 1h1m3 0h3m1 0h1m1 0h2m3 0h1m1 0h1m1 0h1m2 0h1m1 0h6m1 0h2m-25 1h13m2 0h2m3 0h1m2 0h2m-33 1h7m1 0h1m1 0h1m3 0h1m6 0h1m1 0h2m1 0h1m1 0h4m-32 1h1m5 0h1m1 0h6m3 0h3m1 0h2m1 0h1m3 0h1m1 0h1m-31 1h1m1 0h3m1 0h1m1 0h1m1 0h2m1 0h3m4 0h1m1 0h1m1 0h6m1 0h1m-32 1h1m1 0h3m1 0h1m1 0h2m1 0h2m4 0h1m1 0h3m1 0h3m3 0h2m1 0h1m-33 1h1m1 0h3m1 0h1m1 0h2m1 0h1m1 0h1m1 0h1m1 0h1m3 0h2m1 0h1m4 0h2m-31 1h1m5 0h1m1 0h1m4 0h1m2 0h2m2 0h4m1 0h6m-31 1h7m2 0h4m1 0h1m1 0h1m2 0h2m1 0h3m1 0h3m1 0h2";

const SSID = "Imperiya Dyma_5G";
const INK = "#3d3a36";
const INK_SOFT = "rgba(61, 58, 54, 0.78)";

export interface WifiQrProps {
  readonly style?: CSSProperties;
}

export const WifiQr: FC<WifiQrProps> = ({ style }) => {
  const qr = "clamp(46px, 4vw, 88px)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "clamp(10px, 0.95vw, 18px)",
        padding: "clamp(9px, 0.8vw, 15px) clamp(12px, 1.05vw, 20px)",
        background: "rgba(248, 239, 228, 0.55)",
        border: "1px solid rgba(120, 100, 85, 0.22)",
        borderRadius: 16,
        fontFamily: "var(--primary-font-family)",
        ...style,
      }}
    >
      <div
        style={{
          padding: "clamp(7px, 0.72vw, 11px)",
          background: "rgba(255, 252, 247, 0.92)",
          borderRadius: 11,
          lineHeight: 0,
        }}
      >
        <svg
          width={qr}
          height={qr}
          viewBox="0 0 33 33"
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="crispEdges"
          style={{ display: "block" }}
        >
          <path stroke={INK} d={QR_PATH} />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div
          style={{
            fontSize: "clamp(10px, 0.8vw, 15px)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: INK_SOFT,
            lineHeight: 1,
          }}
        >
          Wi-Fi
        </div>
        <div
          style={{
            fontSize: "clamp(15px, 1.2vw, 22px)",
            fontWeight: 700,
            color: INK,
            lineHeight: 1.15,
          }}
        >
          {SSID}
        </div>
        <div
          style={{
            fontSize: "clamp(11px, 0.88vw, 16px)",
            fontWeight: 500,
            color: INK_SOFT,
            lineHeight: 1.1,
          }}
        >
          Наведи камеру и подключайся
        </div>
      </div>
    </div>
  );
};

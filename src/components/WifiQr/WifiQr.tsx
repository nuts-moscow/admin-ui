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

// Match the broadcast left-column ink so it reads as another stat, not a sticker.
const INK = "#3d3a36";
const INK_SOFT = "rgba(61, 58, 54, 0.78)";

export const WifiQr: FC<WifiQrProps> = ({ size = 82, style }) => {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", ...style }}>
      <div
        style={{
          fontFamily: "var(--primary-font-family)",
          fontSize: "var(--chip-broadcast-stat-label-size, 0.95rem)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: INK_SOFT,
          marginBottom: 8,
        }}
      >
        Wi-Fi
      </div>
      {/* The code keeps a tight white quiet-zone (QR needs it to scan); no
          card, border or shadow — it lines up under the label like a value. */}
      <svg
        width={size}
        height={size}
        viewBox="-2 -2 37 37"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        style={{ display: "block", borderRadius: 6 }}
      >
        <rect x="-2" y="-2" width="37" height="37" rx="1.5" fill="#fbf8f1" />
        <path stroke={INK} d={QR_PATH} />
      </svg>
    </div>
  );
};

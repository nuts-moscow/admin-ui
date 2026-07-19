import { CSSProperties, FC } from "react";

/**
 * Wi-Fi QR (SSID «Imperiya Dyma_5G»). Self-contained — no runtime QR
 * dependency; the module path is baked in. Kept on a white quiet-zone so it
 * scans over any broadcast background. Regenerate the path if the network
 * credentials change.
 */
const QR_PATH =
  "M0 0.5h7m1 0h7m3 0h2m1 0h1m4 0h7m-33 1h1m5 0h1m2 0h4m5 0h1m1 0h1m1 0h1m1 0h1m1 0h1m5 0h1m-33 1h1m1 0h3m1 0h1m2 0h1m1 0h5m2 0h1m2 0h1m1 0h2m1 0h1m1 0h3m1 0h1m-33 1h1m1 0h3m1 0h1m2 0h5m1 0h1m2 0h1m3 0h3m1 0h1m1 0h3m1 0h1m-33 1h1m1 0h3m1 0h1m1 0h5m5 0h1m4 0h1m2 0h1m1 0h3m1 0h1m-33 1h1m5 0h1m1 0h1m1 0h2m1 0h2m3 0h1m1 0h2m4 0h1m5 0h1m-33 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-22 1h1m2 0h1m3 0h2m1 0h4m-24 1h7m1 0h1m9 0h1m2 0h1m4 0h2m3 0h1m-33 1h1m1 0h1m1 0h1m2 0h1m1 0h2m1 0h1m1 0h1m2 0h5m1 0h3m6 0h1m-33 1h1m5 0h2m1 0h1m1 0h3m3 0h1m2 0h2m5 0h5m-32 1h1m3 0h2m3 0h1m1 0h3m1 0h4m2 0h4m2 0h5m-32 1h1m1 0h1m1 0h3m3 0h1m3 0h2m3 0h2m1 0h1m7 0h3m-32 1h1m1 0h1m5 0h2m2 0h1m1 0h2m1 0h2m3 0h1m1 0h2m3 0h1m-29 1h1m1 0h1m1 0h3m2 0h2m1 0h4m2 0h3m1 0h2m2 0h4m-32 1h3m2 0h1m1 0h6m6 0h1m1 0h2m2 0h8m-33 1h3m1 0h4m2 0h1m3 0h2m1 0h4m1 0h1m2 0h1m2 0h4m-32 1h1m2 0h3m1 0h2m1 0h5m1 0h1m1 0h3m1 0h1m2 0h1m1 0h1m1 0h2m1 0h1m-32 1h3m2 0h1m2 0h1m2 0h1m1 0h1m1 0h2m2 0h3m3 0h2m3 0h1m-31 1h3m4 0h3m1 0h3m6 0h4m1 0h1m2 0h3m-32 1h3m3 0h1m2 0h1m1 0h1m1 0h1m1 0h2m2 0h2m1 0h2m1 0h1m2 0h1m1 0h1m1 0h1m-33 1h1m3 0h2m2 0h1m1 0h2m1 0h1m2 0h1m1 0h2m1 0h1m1 0h1m2 0h2m1 0h1m1 0h1m-32 1h1m1 0h1m1 0h3m2 0h1m1 0h2m2 0h1m4 0h2m6 0h2m1 0h1m-32 1h1m1 0h2m1 0h1m1 0h1m1 0h1m1 0h1m1 0h6m2 0h1m8 0h1m-31 1h1m3 0h3m1 0h1m1 0h2m3 0h1m1 0h1m1 0h1m2 0h1m1 0h6m1 0h2m-25 1h13m2 0h2m3 0h1m2 0h2m-33 1h7m1 0h1m1 0h1m3 0h1m6 0h1m1 0h2m1 0h1m1 0h4m-32 1h1m5 0h1m1 0h6m3 0h3m1 0h2m1 0h1m3 0h1m1 0h1m-31 1h1m1 0h3m1 0h1m1 0h1m1 0h2m1 0h3m4 0h1m1 0h1m1 0h6m1 0h1m-32 1h1m1 0h3m1 0h1m1 0h2m1 0h2m4 0h1m1 0h3m1 0h3m3 0h2m1 0h1m-33 1h1m1 0h3m1 0h1m1 0h2m1 0h1m1 0h1m1 0h1m1 0h1m3 0h2m1 0h1m4 0h2m-31 1h1m5 0h1m1 0h1m4 0h1m2 0h2m2 0h4m1 0h6m-31 1h7m2 0h4m1 0h1m1 0h1m2 0h2m1 0h3m1 0h3m1 0h2";

export interface WifiQrProps {
  readonly size?: number;
  readonly style?: CSSProperties;
}

export const WifiQr: FC<WifiQrProps> = ({ size = 132, style }) => {
  return (
    <div
      style={{
        background: "#fff",
        padding: size * 0.09,
        borderRadius: 10,
        lineHeight: 0,
        boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 33 33"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        <path stroke="#1b1612" d={QR_PATH} />
      </svg>
    </div>
  );
};

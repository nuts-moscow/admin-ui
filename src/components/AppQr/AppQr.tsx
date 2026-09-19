import { CSSProperties, FC } from "react";

/**
 * Player-app QR (https://player.nuts.moscow). Self-contained — no runtime QR
 * dependency; the module path is baked in. Rendered as the top-right pill on
 * the tournament clock, same treatment the Wi-Fi pill used to get. Regenerate
 * the path if the URL changes.
 */
const QR_PATH =
  "M0 0.5h7m1 0h1m1 0h4m1 0h2m1 0h7M0 1.5h1m5 0h1m3 0h1m1 0h2m2 0h1m1 0h1m5 0h1M0 2.5h1m1 0h3m1 0h1m3 0h3m2 0h1m2 0h1m1 0h3m1 0h1M0 3.5h1m1 0h3m1 0h1m1 0h1m2 0h1m1 0h3m2 0h1m1 0h3m1 0h1M0 4.5h1m1 0h3m1 0h1m1 0h3m1 0h2m1 0h2m1 0h1m1 0h3m1 0h1M0 5.5h1m5 0h1m1 0h5m1 0h1m3 0h1m5 0h1M0 6.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M8 7.5h2m1 0h2m1 0h1M0 8.5h1m3 0h1m1 0h4m2 0h1m1 0h2m1 0h5m2 0h1M0 9.5h3m1 0h2m1 0h1m1 0h1m2 0h1m1 0h3m3 0h2m1 0h1M3 10.5h2m1 0h2m1 0h1m1 0h6m1 0h1m2 0h2M2 11.5h1m5 0h1m1 0h2m5 0h1m4 0h2M3 12.5h4m1 0h1m1 0h1m1 0h1m2 0h1m1 0h2m2 0h4M0 13.5h4m4 0h2m2 0h1m1 0h2m4 0h1m2 0h1M3 14.5h2m1 0h1m4 0h2m1 0h4m1 0h4M2 15.5h4m1 0h1m1 0h2m1 0h1m1 0h1m1 0h1m2 0h2m1 0h2M0 16.5h2m1 0h2m1 0h2m1 0h1m6 0h7M8 17.5h4m2 0h3m3 0h1M0 18.5h7m1 0h1m1 0h5m1 0h1m1 0h1m1 0h1M0 19.5h1m5 0h1m5 0h1m1 0h1m1 0h1m3 0h5M0 20.5h1m1 0h3m1 0h1m1 0h1m1 0h3m3 0h7M0 21.5h1m1 0h3m1 0h1m2 0h3m1 0h1m1 0h1m1 0h3m2 0h3M0 22.5h1m1 0h3m1 0h1m3 0h4m2 0h1m1 0h1m2 0h1m1 0h1M0 23.5h1m5 0h1m2 0h2m3 0h2m1 0h7M0 24.5h7m1 0h1m3 0h1m2 0h1m1 0h2m3 0h3";

const INK = "#3d3a36";
const INK_SOFT = "rgba(61, 58, 54, 0.78)";

export interface AppQrProps {
  readonly style?: CSSProperties;
}

export const AppQr: FC<AppQrProps> = ({ style }) => {
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
          viewBox="0 0 25 25"
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
          Nuts App
        </div>
        <div
          style={{
            fontSize: "clamp(15px, 1.2vw, 22px)",
            fontWeight: 700,
            color: INK,
            lineHeight: 1.15,
          }}
        >
          Наведи камеру и заходи в наше приложение
        </div>
        <div
          style={{
            fontSize: "clamp(11px, 0.88vw, 16px)",
            fontWeight: 500,
            color: INK_SOFT,
            lineHeight: 1.1,
          }}
        >
          Вопросы? Спроси администратора
        </div>
      </div>
    </div>
  );
};

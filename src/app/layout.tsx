import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { getEnvironmentWithReqCookies } from "@/core/states/environment/environmentSsr";
import { BodyLayout } from "./BodyLayout/BodyLayout";

/** Геометрический гротеск — как строка «FAMILY» в логотипе; основной UI. */
const uiSans = Montserrat({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
  variable: "--font-ui",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

/** Контрастная классическая антиква — как «NUTS» в логотипе; заголовки. */
const displaySerif = Playfair_Display({
  subsets: ["latin", "cyrillic", "latin-ext"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "NUTS Admin",
  description: "NUTS FAMILY Administration Panel",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rrc = await cookies();
  const environment = await getEnvironmentWithReqCookies(rrc);

  return (
    <html
      lang="en"
      className={`light ${uiSans.variable} ${displaySerif.variable}`}
    >
      <body suppressHydrationWarning={true}>
        <BodyLayout environment={environment}>{children}</BodyLayout>
      </body>
    </html>
  );
}

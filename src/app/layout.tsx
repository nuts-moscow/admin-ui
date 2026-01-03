import type { Metadata } from "next";
import "./globals.css";
import { cookies } from "next/headers";
import { getEnvironmentWithReqCookies } from "@/core/states/environment/environmentSsr";
import { BodyLayout } from "./BodyLayout/BodyLayout";

export const metadata: Metadata = {
  title: "NUTS Admin",
  description: "NUTS FAMILY Administration Panel",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rrc = await cookies();
  const environment = await getEnvironmentWithReqCookies(rrc);

  return (
    <html lang="en" className="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body suppressHydrationWarning={true}>
        <BodyLayout environment={environment}>{children}</BodyLayout>
      </body>
    </html>
  );
}

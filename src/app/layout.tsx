import type { Metadata } from 'next';
import './globals.css';
import { clsx } from 'clsx';
import { cookies } from 'next/headers';
import { getEnvironmentWithReqCookies } from '@/core/states/environment/environmentSsr';
import { EnvironmentProvider } from '@/core/states/environment/useEnvironment';

export const metadata: Metadata = {
  title: 'NUTS Admin',
  description: 'NUTS FAMILY Administration Panel',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = 'light'; // Default theme
  const rrc = await cookies();
  const environment = await getEnvironmentWithReqCookies(rrc);
  
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body suppressHydrationWarning={true}>
        <EnvironmentProvider environment={environment}>
          {children}
        </EnvironmentProvider>
      </body>
    </html>
  );
}

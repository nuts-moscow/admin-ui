import type { Metadata } from 'next';
import './globals.css';
import { clsx } from 'clsx';

export const metadata: Metadata = {
  title: 'NUTS Admin',
  description: 'NUTS FAMILY Administration Panel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = 'light'; // Default theme
  
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}

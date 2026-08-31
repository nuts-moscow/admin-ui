import type { NextConfig } from 'next';
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin();

const isDev = process.env.NODE_ENV !== 'production';

// Same override as applicationConfig.ts — must stay in sync with it, since a
// non-default API origin needs both the fetch target *and* CSP allowance
// changed, or the browser blocks the request regardless of apiUrl.
const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? 'https://nuts.moscow';
const wsOrigin = apiOrigin.replace(/^https:/, 'wss:');

// In dev mode Next.js uses eval (source maps) and ws://localhost (HMR),
// both of which would be blocked by a strict CSP.
const cspValue = isDev
  ? [
      "default-src 'self'",
      `connect-src 'self' ${apiOrigin} ${wsOrigin} ws://localhost:* wss://localhost:*`,
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  : [
      "default-src 'self'",
      `connect-src 'self' ${apiOrigin} ${wsOrigin}`,
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: cspValue },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withVanillaExtract(nextConfig);

import { NextResponse } from 'next/server'

/**
 * Security headers to prevent common web vulnerabilities
 */
export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy (formerly Feature Policy)
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), interest-cohort=()',

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.sugarflag.com https://*.clerk.accounts.dev",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com https://world.openfoodfacts.org https://api.stripe.com https://clerk.sugarflag.com https://*.clerk.accounts.dev https://us.i.posthog.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://clerk.sugarflag.com https://*.clerk.accounts.dev",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // Strict Transport Security (HTTPS only)
  // Only enable in production with HTTPS
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  }),
}

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Create a response with security headers
 */
export function createSecureResponse(
  body: any,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(body, init)
  return applySecurityHeaders(response)
}

import { NextRequest, NextResponse } from 'next/server'
import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number // time window in milliseconds
  uniqueTokenPerInterval: number // max number of unique tokens
}

// Simple in-memory rate limiter using LRU cache
// For production with multiple instances, use Redis (Upstash)
export class RateLimiter {
  private tokenCache: LRUCache<string, number[]>

  constructor(private options: RateLimitOptions) {
    this.tokenCache = new LRUCache({
      max: options.uniqueTokenPerInterval || 500,
      ttl: options.interval || 60000,
    })
  }

  check(token: string, limit: number): { success: boolean; remaining: number; reset: number } {
    const tokenCount = this.tokenCache.get(token) || [0]
    const currentUsage = tokenCount[0]
    const now = Date.now()
    const reset = now + this.options.interval

    if (currentUsage >= limit) {
      return {
        success: false,
        remaining: 0,
        reset,
      }
    }

    tokenCount[0] = currentUsage + 1
    this.tokenCache.set(token, tokenCount)

    return {
      success: true,
      remaining: limit - tokenCount[0],
      reset,
    }
  }
}

// Rate limiters for different endpoints
export const rateLimiters = {
  // API routes - 100 requests per minute
  api: new RateLimiter({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 500,
  }),
  // Scan endpoint - 30 requests per minute (expensive OCR)
  scan: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
  }),
  // Auth routes - 10 requests per minute
  auth: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
  }),
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  limit: number
): Promise<NextResponse | null> {
  // Use IP address + user agent as token for better uniqueness
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const token = `${ip}-${userAgent}`

  const { success, remaining, reset } = limiter.check(token, limit)

  if (!success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  return null // Continue processing
}

/**
 * Middleware wrapper for rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  limiter: RateLimiter,
  limit: number
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = await applyRateLimit(request, limiter, limit)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    return handler(request)
  }
}

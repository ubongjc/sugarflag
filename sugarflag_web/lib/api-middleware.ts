import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getAuthUserId } from './auth'
import { applyRateLimit, RateLimiter } from './rate-limit'
import { applySecurityHeaders } from './security-headers'
import { z } from 'zod'

export interface ApiHandlerContext {
  userId: string
  request: NextRequest
}

export type ApiHandler<T = any> = (
  context: ApiHandlerContext
) => Promise<NextResponse<T>>

export interface ApiRouteOptions {
  auth?: boolean // Require authentication (default: true)
  rateLimit?: {
    limiter: RateLimiter
    limit: number
  }
  validateBody?: z.ZodSchema
}

/**
 * Wrapper for API routes that adds:
 * - Authentication
 * - Rate limiting
 * - Security headers
 * - Error handling
 * - Request validation
 */
export function createApiRoute<T = any>(
  handler: ApiHandler<T>,
  options: ApiRouteOptions = {}
) {
  const {
    auth: requireAuthOption = true,
    rateLimit,
    validateBody,
  } = options

  return async (request: NextRequest): Promise<NextResponse<T>> => {
    try {
      // Apply rate limiting if configured
      if (rateLimit) {
        const rateLimitResponse = await applyRateLimit(
          request,
          rateLimit.limiter,
          rateLimit.limit
        )
        if (rateLimitResponse) {
          return rateLimitResponse as NextResponse<T>
        }
      }

      // Check authentication if required
      let userId: string
      if (requireAuthOption) {
        try {
          userId = await requireAuth()
        } catch (error) {
          const response = NextResponse.json(
            {
              error: 'Unauthorized',
              message: 'Authentication required',
            } as any,
            { status: 401 }
          )
          return applySecurityHeaders(response)
        }
      } else {
        // Try to get userId but don't fail if not authenticated
        userId = (await getAuthUserId()) || 'anonymous'
      }

      // Validate request body if schema provided
      if (validateBody) {
        try {
          const body = await request.json()
          validateBody.parse(body)
          // Re-create request with validated body
          // (Next.js doesn't allow modifying the request, so we'll handle validation in the handler)
        } catch (error) {
          if (error instanceof z.ZodError) {
            const response = NextResponse.json(
              {
                error: 'Validation error',
                details: error.errors.map((e) => ({
                  path: e.path.join('.'),
                  message: e.message,
                })),
              } as any,
              { status: 400 }
            )
            return applySecurityHeaders(response)
          }
        }
      }

      // Call the actual handler
      const response = await handler({
        userId,
        request,
      })

      // Apply security headers to response
      return applySecurityHeaders(response)
    } catch (error) {
      console.error('API route error:', error)

      // Don't expose internal errors in production
      const message =
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : 'Internal server error'

      const response = NextResponse.json(
        {
          error: 'Internal server error',
          message,
        } as any,
        { status: 500 }
      )

      return applySecurityHeaders(response)
    }
  }
}

/**
 * Simplified wrapper for public API routes (no auth required)
 */
export function createPublicApiRoute<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return createApiRoute(
    async (context) => handler(context.request),
    { auth: false }
  )
}

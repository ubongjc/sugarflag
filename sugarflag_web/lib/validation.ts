import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 10000) // Limit input length
}

/**
 * Validate UPC/barcode format
 */
export function isValidUPC(upc: string): boolean {
  // UPC-A: 12 digits
  // EAN-13: 13 digits
  // Also allow common variations
  return /^[0-9]{8,14}$/.test(upc)
}

/**
 * Validate base64 image data
 */
export function isValidBase64Image(data: string): boolean {
  // Check if it's a valid base64 string
  const base64Regex = /^data:image\/(png|jpg|jpeg|webp);base64,[A-Za-z0-9+/=]+$/
  if (!base64Regex.test(data)) {
    return false
  }

  // Check size (max 10MB)
  const sizeInBytes = (data.length * 3) / 4
  const maxSizeInBytes = 10 * 1024 * 1024 // 10MB
  return sizeInBytes <= maxSizeInBytes
}

/**
 * Common validation schemas
 */
export const schemas = {
  upc: z.string().regex(/^[0-9]{8,14}$/, 'Invalid UPC format'),

  email: z.string().email('Invalid email address'),

  photo: z.string().refine(
    (data) => isValidBase64Image(data),
    'Invalid image format or size (max 10MB)'
  ),

  scanRequest: z.object({
    upc: z.string().regex(/^[0-9]{8,14}$/).optional(),
    photo: z.string().optional(),
  }).refine(
    (data) => data.upc || data.photo,
    'Either UPC or photo must be provided'
  ).refine(
    (data) => !data.photo || isValidBase64Image(data.photo),
    'Invalid photo format or size'
  ),

  feedback: z.object({
    scanId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
  }),

  preferences: z.object({
    dietType: z.enum(['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo']).optional(),
    restrictions: z.array(z.string().max(50)).max(20).optional(),
    dislikes: z.array(z.string().max(50)).max(20).optional(),
    maxSugar: z.number().int().min(0).max(100).optional(),
    budgetPerWeek: z.number().int().min(0).max(10000).optional(),
  }),

  search: z.object({
    query: z.string().min(1).max(100),
    useExternal: z.boolean().optional(),
  }),
}

/**
 * Validate and parse request body
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: NextResponse.json(
          {
            error: 'Validation error',
            details: error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      }
    }
    return {
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      ),
    }
  }
}

/**
 * SQL injection prevention patterns
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|(\\')|(\\"))/gi,
  ]

  return sqlPatterns.some((pattern) => pattern.test(input))
}

/**
 * Validate environment variables at startup
 */
export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
    // Don't throw in development to allow easier setup
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }

  // Warn about optional but recommended variables
  const recommended = [
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'POSTHOG_API_KEY',
  ]

  const missingRecommended = recommended.filter((key) => !process.env[key])
  if (missingRecommended.length > 0) {
    console.warn('⚠️  Missing recommended environment variables:', missingRecommended.join(', '))
  }
}

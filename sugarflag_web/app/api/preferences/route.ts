import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const PreferenceSchema = z.object({
  dislikes: z.array(z.string()).optional(),
  budgetMax: z.number().optional(),
  culturalCuisines: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  tasteProfile: z.any().optional(),
})

/**
 * GET /api/preferences
 * Get user preferences
 */
export async function GET(request: NextRequest) {
  try {
    // For MVP, use test user
    const userId = 'test-user-id'

    const preferences = await prisma.preference.findUnique({
      where: { userId },
    })

    if (!preferences) {
      return NextResponse.json({
        preferences: {
          dislikes: [],
          budgetMax: null,
          culturalCuisines: [],
          dietaryRestrictions: [],
          tasteProfile: null,
        },
      })
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Get preferences error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/preferences
 * Create or update user preferences
 */
export async function POST(request: NextRequest) {
  try {
    // For MVP, use test user
    const userId = 'test-user-id'

    const body = await request.json()
    const validated = PreferenceSchema.parse(body)

    const preferences = await prisma.preference.upsert({
      where: { userId },
      update: validated,
      create: {
        userId,
        ...validated,
      },
    })

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Update preferences error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/preferences
 * Delete user preferences
 */
export async function DELETE(request: NextRequest) {
  try {
    // For MVP, use test user
    const userId = 'test-user-id'

    await prisma.preference.deleteMany({
      where: { userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete preferences error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

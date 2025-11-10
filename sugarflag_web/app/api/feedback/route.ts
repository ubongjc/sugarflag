import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const FeedbackSchema = z.object({
  scanId: z.string(),
  thumbsUp: z.boolean(),
  notes: z.string().optional(),
})

/**
 * POST /api/feedback
 * Submit feedback on a scan result
 */
export async function POST(request: NextRequest) {
  try {
    // For MVP, use test user
    const userId = 'test-user-id'

    const body = await request.json()
    const validated = FeedbackSchema.parse(body)

    // Verify scan exists and belongs to user
    const scan = await prisma.scan.findFirst({
      where: {
        id: validated.scanId,
        userId,
      },
    })

    if (!scan) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Scan not found' },
        { status: 404 }
      )
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        scanId: validated.scanId,
        thumbsUp: validated.thumbsUp,
        notes: validated.notes,
      },
    })

    return NextResponse.json({ success: true, feedbackId: feedback.id })
  } catch (error) {
    console.error('Feedback error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/feedback?scanId=xxx
 * Get feedback for a specific scan
 */
export async function GET(request: NextRequest) {
  try {
    const scanId = request.nextUrl.searchParams.get('scanId')

    if (!scanId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'scanId parameter required' },
        { status: 400 }
      )
    }

    const feedback = await prisma.feedback.findMany({
      where: { scanId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Get feedback error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

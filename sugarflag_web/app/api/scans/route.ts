import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/scans
 * Get scan history for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // For MVP, use test user
    const userId = 'test-user-id'

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get total count
    const total = await prisma.scan.count({
      where: { userId },
    })

    // Get scans with product info
    const scans = await prisma.scan.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            sweeteners: {
              include: {
                sweetener: true,
              },
              orderBy: {
                position: 'asc',
              },
            },
          },
        },
        feedback: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    return NextResponse.json({
      scans: scans.map((scan) => ({
        id: scan.id,
        score: scan.score,
        scanType: scan.scanType,
        rationale: scan.rationale,
        uncertainty: scan.uncertainty,
        createdAt: scan.createdAt.toISOString(),
        product: scan.product
          ? {
              upc: scan.product.upc,
              name: scan.product.name,
              brand: scan.product.brand,
              totalSugars: scan.product.totalSugars,
              addedSugars: scan.product.addedSugars,
            }
          : null,
        feedback: scan.feedback.length > 0 ? scan.feedback[0] : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get scans error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch scan history',
      },
      { status: 500 }
    )
  }
}

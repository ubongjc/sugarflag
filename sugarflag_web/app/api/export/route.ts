import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/export
 * Export all user data (GDPR compliance)
 */
export async function GET(request: NextRequest) {
  try {
    // For MVP, use test user
    const userId = 'test-user-id'

    // Fetch all user data
    const [user, scans, preferences, feedback] = await Promise.all([
      prisma.user.findUnique({ where: { clerkId: userId } }),
      prisma.scan.findMany({
        where: { userId },
        include: {
          product: true,
        },
      }),
      prisma.preference.findUnique({ where: { userId } }),
      prisma.feedback.findMany({ where: { userId } }),
    ])

    const exportData = {
      user,
      scans: scans.map((scan) => ({
        id: scan.id,
        score: scan.score,
        scanType: scan.scanType,
        rationale: scan.rationale,
        createdAt: scan.createdAt.toISOString(),
        product: scan.product
          ? {
              upc: scan.product.upc,
              name: scan.product.name,
              brand: scan.product.brand,
            }
          : null,
      })),
      preferences,
      feedback,
      exportedAt: new Date().toISOString(),
    }

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="sugarflag-data-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to export data' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/export
 * Delete all user data (GDPR right to be forgotten)
 */
export async function DELETE(request: NextRequest) {
  try {
    // For MVP, use test user
    const userId = 'test-user-id'

    // Delete all user data in transaction
    await prisma.$transaction([
      prisma.feedback.deleteMany({ where: { userId } }),
      prisma.scan.deleteMany({ where: { userId } }),
      prisma.cartSuggestion.deleteMany({ where: { userId } }),
      prisma.preference.deleteMany({ where: { userId } }),
      prisma.user.deleteMany({ where: { clerkId: userId } }),
    ])

    return NextResponse.json({
      success: true,
      message: 'All user data has been deleted',
    })
  } catch (error) {
    console.error('Delete user data error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to delete user data' },
      { status: 500 }
    )
  }
}

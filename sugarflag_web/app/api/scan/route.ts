import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ScanRequestSchema, ScanResponse } from '@/lib/types'
import { calculateSugarScore } from '@/lib/scoring'
import { auth } from '@clerk/nextjs'

/**
 * POST /api/scan
 *
 * Scans a product via UPC or photo and returns sugar/sweetener analysis
 *
 * Body:
 * - upc?: string - UPC barcode
 * - photo?: string - base64 encoded image
 * - locale?: string - user locale (default: en-US)
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check (comment out for testing without auth)
    // const { userId } = auth()
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized', message: 'Authentication required' },
    //     { status: 401 }
    //   )
    // }

    // For MVP, use a test user ID
    const userId = 'test-user-id'

    const body = await request.json()
    const validatedData = ScanRequestSchema.parse(body)

    let product
    let scanType: 'upc' | 'photo' | 'manual'

    // Path 1: UPC lookup
    if (validatedData.upc) {
      scanType = 'upc'

      // Look up product by UPC
      product = await prisma.product.findUnique({
        where: { upc: validatedData.upc },
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
      })

      if (!product) {
        // Check for alias
        const alias = await prisma.aliasUPC.findUnique({
          where: { upc: validatedData.upc },
          include: {
            canonical: {
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
          },
        })

        if (alias) {
          product = alias.canonical
        }
      }

      if (!product) {
        return NextResponse.json(
          {
            error: 'Not Found',
            message: `Product with UPC ${validatedData.upc} not found in database`,
            details: { upc: validatedData.upc },
          },
          { status: 404 }
        )
      }
    }
    // Path 2: Photo OCR
    else if (validatedData.photo) {
      scanType = 'photo'

      // TODO: Implement OCR processing
      // For now, return a stub response
      return NextResponse.json(
        {
          error: 'Not Implemented',
          message: 'Photo OCR is not yet implemented. Use UPC scanning for now.',
          details: { feature: 'photo-ocr', status: 'planned' },
        },
        { status: 501 }
      )
    } else {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Either upc or photo must be provided',
        },
        { status: 400 }
      )
    }

    // Calculate sugar score
    const scoreResult = calculateSugarScore(
      product.addedSugars,
      product.totalSugars,
      product.sweeteners,
      product.servingSize
    )

    // Create scan record
    const scan = await prisma.scan.create({
      data: {
        userId,
        productId: product.id,
        score: scoreResult.score,
        scanType,
        rationale: scoreResult.rationale,
        uncertainty: scoreResult.uncertainty,
        locale: validatedData.locale,
      },
    })

    // Format response
    const response: ScanResponse = {
      scanId: scan.id,
      score: scoreResult.score,
      sweeteners: product.sweeteners.map((ps) => ({
        name: ps.sweetener.name,
        type: ps.sweetener.type as 'added_sugar' | 'artificial' | 'natural_alternative',
        position: ps.position,
        healthScore: ps.sweetener.healthScore,
      })),
      rationale: scoreResult.rationale,
      uncertainty: scoreResult.uncertainty > 0 ? scoreResult.uncertainty : undefined,
      product: {
        upc: product.upc,
        name: product.name,
        brand: product.brand,
        totalSugars: product.totalSugars ?? undefined,
        addedSugars: product.addedSugars ?? undefined,
        servingSize: product.servingSize ?? undefined,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Scan error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

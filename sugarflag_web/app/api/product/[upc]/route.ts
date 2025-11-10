import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProductResponse } from '@/lib/types'

/**
 * GET /api/product/[upc]
 *
 * Retrieves detailed product information by UPC
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { upc: string } }
) {
  try {
    const { upc } = params

    if (!upc) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'UPC parameter is required' },
        { status: 400 }
      )
    }

    // Look up product by UPC
    let product = await prisma.product.findUnique({
      where: { upc },
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

    // Check for alias if not found
    if (!product) {
      const alias = await prisma.aliasUPC.findUnique({
        where: { upc },
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
          message: `Product with UPC ${upc} not found`,
        },
        { status: 404 }
      )
    }

    // Format response
    const response: ProductResponse = {
      id: product.id,
      upc: product.upc,
      name: product.name,
      brand: product.brand,
      description: product.description ?? undefined,
      nutrients: {
        servingSize: product.servingSize ?? undefined,
        calories: product.calories ?? undefined,
        totalSugars: product.totalSugars ?? undefined,
        addedSugars: product.addedSugars ?? undefined,
        totalCarbs: product.totalCarbs ?? undefined,
        protein: product.protein ?? undefined,
        fat: product.fat ?? undefined,
        sodium: product.sodium ?? undefined,
        fiber: product.fiber ?? undefined,
      },
      ingredients: product.ingredients ?? undefined,
      sweeteners: product.sweeteners.map((ps) => ({
        name: ps.sweetener.name,
        type: ps.sweetener.type as 'added_sugar' | 'artificial' | 'natural_alternative',
        position: ps.position,
        healthScore: ps.sweetener.healthScore,
      })),
    }

    // Cache for 1 hour with stale-while-revalidate
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Product lookup error:', error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

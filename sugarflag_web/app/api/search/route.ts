import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { searchProducts } from '@/lib/openfoodfacts'

/**
 * GET /api/search?q=query&page=1&limit=20
 * Search for products by name or brand
 */
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q')
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
    const source = request.nextUrl.searchParams.get('source') || 'local'

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    if (source === 'external') {
      // Search OpenFoodFacts
      const results = await searchProducts(query, page, limit)

      return NextResponse.json({
        products: results.map((p) => ({
          upc: p.code,
          name: p.product_name || 'Unknown Product',
          brand: p.brands || 'Unknown Brand',
          source: 'openfoodfacts',
        })),
        pagination: {
          page,
          limit,
        },
      })
    } else {
      // Search local database
      const skip = (page - 1) * limit

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { brand: { contains: query, mode: 'insensitive' } },
              { ingredients: { contains: query, mode: 'insensitive' } },
            ],
          },
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
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.product.count({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { brand: { contains: query, mode: 'insensitive' } },
              { ingredients: { contains: query, mode: 'insensitive' } },
            ],
          },
        }),
      ])

      return NextResponse.json({
        products: products.map((p) => ({
          id: p.id,
          upc: p.upc,
          name: p.name,
          brand: p.brand,
          totalSugars: p.totalSugars,
          addedSugars: p.addedSugars,
          sweeteners: p.sweeteners.map((ps) => ({
            name: ps.sweetener.name,
            type: ps.sweetener.type,
          })),
          source: 'local',
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Search failed' },
      { status: 500 }
    )
  }
}

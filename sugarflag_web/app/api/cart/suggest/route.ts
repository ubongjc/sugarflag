import { NextRequest, NextResponse } from 'next/server'
import { CartSuggestionResponse } from '@/lib/types'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/cart/suggest
 *
 * Generates a weekly lower-sugar cart suggestion personalized to user preferences
 */
export async function GET(request: NextRequest) {
  try {
    // For MVP, use test user
    const userId = 'test-user-id'

    // Get current week start (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - daysToMonday)
    weekStart.setHours(0, 0, 0, 0)

    // Check if we already have a suggestion for this week
    const existing = await prisma.cartSuggestion.findFirst({
      where: {
        userId,
        weekOf: weekStart,
        status: 'active',
      },
    })

    if (existing) {
      const response: CartSuggestionResponse = {
        id: existing.id,
        weekOf: existing.weekOf.toISOString(),
        items: existing.items as any[],
        estSavings: existing.estSavings ?? undefined,
        totalCost: existing.totalCost ?? undefined,
        generatedAt: existing.generatedAt.toISOString(),
      }
      return NextResponse.json(response)
    }

    // Get user preferences
    const preferences = await prisma.preference.findUnique({
      where: { userId },
    })

    // Get low-sugar products from database
    const lowSugarProducts = await prisma.product.findMany({
      where: {
        addedSugars: {
          lte: 5, // 5g or less added sugar
        },
      },
      include: {
        sweeteners: {
          include: {
            sweetener: true,
          },
        },
      },
      take: 10,
      orderBy: {
        addedSugars: 'asc',
      },
    })

    // Build cart items from low-sugar products
    const items = lowSugarProducts.slice(0, 7).map((product) => ({
      productId: product.id,
      upc: product.upc,
      name: product.name,
      brand: product.brand,
      quantity: 1,
      price: 4.99, // Default price (would come from pricing API)
      reason: `${product.addedSugars === 0 ? 'No' : 'Low'} added sugars (${product.addedSugars || 0}g). Great alternative!`,
      sugarSavings: (10 - (product.addedSugars || 0)) * 2, // Estimated weekly savings
    }))

    // Calculate total savings and cost
    const estSavings = items.reduce((sum, item) => sum + (item.sugarSavings || 0), 0)
    const totalCost = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)

    // Create cart suggestion in database
    const cartSuggestion = await prisma.cartSuggestion.create({
      data: {
        userId,
        weekOf: weekStart,
        items: items as any,
        estSavings,
        totalCost,
        status: 'active',
      },
    })

    const response: CartSuggestionResponse = {
      id: cartSuggestion.id,
      weekOf: cartSuggestion.weekOf.toISOString(),
      items,
      estSavings,
      totalCost,
      generatedAt: cartSuggestion.generatedAt.toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Cart suggestion error:', error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}

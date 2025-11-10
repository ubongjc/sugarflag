import { NextRequest, NextResponse } from 'next/server'
import { CartSuggestionResponse } from '@/lib/types'

/**
 * GET /api/cart/suggest
 *
 * Generates a weekly lower-sugar cart suggestion personalized to user preferences
 * Currently returns mock data - will be replaced with real recommendation engine
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check (comment out for testing)
    // const { userId } = auth()
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized', message: 'Authentication required' },
    //     { status: 401 }
    //   )
    // }

    // Get current week start (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - daysToMonday)
    weekStart.setHours(0, 0, 0, 0)

    // Mock cart suggestion data
    const mockSuggestion: CartSuggestionResponse = {
      id: 'mock-cart-001',
      weekOf: weekStart.toISOString(),
      items: [
        {
          productId: 'prod-001',
          upc: '012000161551',
          name: 'Unsweetened Almond Milk',
          brand: 'Silk',
          quantity: 2,
          price: 3.99,
          reason: 'Lower-sugar alternative to your usual 2% milk. Saves 24g sugar per serving.',
          sugarSavings: 48,
        },
        {
          productId: 'prod-002',
          upc: '070470002075',
          name: 'Organic Plain Greek Yogurt',
          brand: 'Fage',
          quantity: 1,
          price: 5.49,
          reason: 'Replace flavored yogurt. Add your own fruit to control sugar.',
          sugarSavings: 15,
        },
        {
          productId: 'prod-003',
          upc: '041190468492',
          name: 'Dark Chocolate 85% Cacao',
          brand: 'Lindt',
          quantity: 1,
          price: 3.29,
          reason: 'Higher cacao percentage means less sugar than milk chocolate.',
          sugarSavings: 12,
        },
        {
          productId: 'prod-004',
          upc: '052603051859',
          name: 'Steel Cut Oats',
          brand: 'Quaker',
          quantity: 1,
          price: 4.99,
          reason: 'Replace instant oatmeal packets. No added sugars, customize with fruit.',
          sugarSavings: 20,
        },
        {
          productId: 'prod-005',
          upc: '074175434120',
          name: 'Sparkling Water - Lime',
          brand: 'LaCroix',
          quantity: 1,
          price: 4.99,
          reason: 'Zero-sugar alternative to soda. Natural flavoring only.',
          sugarSavings: 39,
        },
        {
          productId: 'prod-006',
          upc: '085239012598',
          name: 'Almond Butter',
          brand: 'Justin\'s',
          quantity: 1,
          price: 8.99,
          reason: 'Better than sweetened peanut butter. Only almonds and salt.',
          sugarSavings: 8,
        },
        {
          productId: 'prod-007',
          upc: '041303002230',
          name: 'Whole Grain Bread',
          brand: 'Dave\'s Killer Bread',
          quantity: 1,
          price: 5.99,
          reason: 'Lower sugar than many store brands. High in fiber.',
          sugarSavings: 6,
        },
      ],
      estSavings: 148, // total grams of sugar saved per week
      totalCost: 37.73,
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(mockSuggestion)
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

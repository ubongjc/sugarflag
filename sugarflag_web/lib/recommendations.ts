import { prisma } from './prisma'
import { Product, Scan, Preference } from '@prisma/client'

interface RecommendationOptions {
  userId: string
  limit?: number
  excludeProductIds?: string[]
}

interface ScoredProduct extends Product {
  recommendationScore: number
  reason: string
  affiliateLink?: string
}

/**
 * Advanced recommendation engine using multiple signals
 */
export class RecommendationEngine {
  /**
   * Get personalized product recommendations
   */
  static async getRecommendations(
    options: RecommendationOptions
  ): Promise<ScoredProduct[]> {
    const { userId, limit = 10, excludeProductIds = [] } = options

    // Fetch user data
    const [preferences, scans] = await Promise.all([
      prisma.preference.findUnique({ where: { userId } }),
      prisma.scan.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ])

    // Get candidate products (low sugar products)
    const candidates = await prisma.product.findMany({
      where: {
        AND: [
          {
            id: {
              notIn: excludeProductIds,
            },
          },
          {
            OR: [
              { addedSugars: { lte: 5 } },
              { totalSugars: { lte: 10 } },
            ],
          },
        ],
      },
      include: {
        sweeteners: {
          include: {
            sweetener: true,
          },
        },
      },
      take: 100,
    })

    // Score each product
    const scoredProducts = candidates.map((product) => {
      let score = 0
      const reasons: string[] = []

      // 1. Sugar content score (40% weight)
      const sugarScore = this.calculateSugarScore(product)
      score += sugarScore * 0.4
      if (product.addedSugars === 0) {
        reasons.push('No added sugars')
      } else if (product.addedSugars && product.addedSugars <= 3) {
        reasons.push('Very low added sugars')
      }

      // 2. Sweetener quality score (30% weight)
      const sweetenerScore = this.calculateSweetenerScore(product)
      score += sweetenerScore * 0.3
      const naturalSweeteners = product.sweeteners.filter(
        (ps) => ps.sweetener.type === 'natural_alternative'
      )
      if (naturalSweeteners.length > 0) {
        reasons.push(`Uses ${naturalSweeteners[0].sweetener.name}`)
      }

      // 3. User preference alignment (20% weight)
      if (preferences) {
        const preferenceScore = this.calculatePreferenceScore(product, preferences)
        score += preferenceScore * 0.2

        // Check dietary restrictions
        if (this.matchesDietaryRestrictions(product, preferences)) {
          reasons.push('Matches your dietary preferences')
          score += 10
        }
      }

      // 4. Collaborative filtering (10% weight)
      const collaborativeScore = this.calculateCollaborativeScore(product, scans)
      score += collaborativeScore * 0.1

      // 5. Nutrition bonus
      if (product.protein && product.protein >= 10) {
        score += 5
        reasons.push('High protein')
      }
      if (product.fiber && product.fiber >= 5) {
        score += 5
        reasons.push('High fiber')
      }

      return {
        ...product,
        recommendationScore: Math.round(score),
        reason: reasons.length > 0 ? reasons.join('. ') + '.' : 'Great alternative!',
        affiliateLink: this.getAffiliateLink(product),
      }
    })

    // Sort by score and return top results
    return scoredProducts
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit)
  }

  /**
   * Calculate sugar score (0-100, higher is better)
   */
  private static calculateSugarScore(product: Product): number {
    if (product.addedSugars === null && product.totalSugars === null) {
      return 50 // Neutral score if no data
    }

    const addedSugars = product.addedSugars || product.totalSugars || 0

    if (addedSugars === 0) return 100
    if (addedSugars <= 2) return 90
    if (addedSugars <= 5) return 75
    if (addedSugars <= 10) return 50
    if (addedSugars <= 15) return 30
    return 10
  }

  /**
   * Calculate sweetener quality score
   */
  private static calculateSweetenerScore(product: Product & { sweeteners: any[] }): number {
    if (product.sweeteners.length === 0) return 100 // No sweeteners = best

    let score = 50
    const types = product.sweeteners.map((ps) => ps.sweetener.type)

    // Natural alternatives are good
    if (types.includes('natural_alternative')) {
      score += 30
    }

    // Artificial sweeteners are okay
    if (types.includes('artificial') && !types.includes('added_sugar')) {
      score += 10
    }

    // Added sugars reduce score
    if (types.includes('added_sugar')) {
      score -= 20
    }

    // Average health score of sweeteners
    const avgHealthScore =
      product.sweeteners.reduce((sum, ps) => sum + ps.sweetener.healthScore, 0) /
      product.sweeteners.length
    score += (avgHealthScore - 50) * 0.4

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculate preference alignment score
   */
  private static calculatePreferenceScore(product: Product, preferences: Preference): number {
    let score = 50

    // Check dislikes
    if (preferences.dislikes && preferences.dislikes.length > 0) {
      const ingredients = (product.ingredients || '').toLowerCase()
      const hasDislikes = preferences.dislikes.some((dislike) =>
        ingredients.includes(dislike.toLowerCase())
      )
      if (hasDislikes) {
        score -= 40
      }
    }

    return Math.max(0, score)
  }

  /**
   * Check if product matches dietary restrictions
   */
  private static matchesDietaryRestrictions(
    product: Product,
    preferences: Preference
  ): boolean {
    if (!preferences.dietaryRestrictions || preferences.dietaryRestrictions.length === 0) {
      return false
    }

    const ingredients = (product.ingredients || '').toLowerCase()

    for (const restriction of preferences.dietaryRestrictions) {
      switch (restriction.toLowerCase()) {
        case 'vegan':
          if (
            ingredients.includes('milk') ||
            ingredients.includes('egg') ||
            ingredients.includes('honey')
          ) {
            return false
          }
          break
        case 'gluten-free':
          if (ingredients.includes('wheat') || ingredients.includes('barley')) {
            return false
          }
          break
        // Add more restrictions as needed
      }
    }

    return true
  }

  /**
   * Calculate collaborative filtering score
   * (Based on what similar users liked)
   */
  private static calculateCollaborativeScore(
    product: Product,
    userScans: Array<Scan & { product: Product | null }>
  ): number {
    // Simple version: prefer products similar to ones user has scanned with high scores
    const similarProducts = userScans.filter(
      (scan) =>
        scan.product &&
        scan.score >= 70 &&
        scan.product.brand === product.brand
    )

    return Math.min(100, similarProducts.length * 20)
  }

  /**
   * Get affiliate link for product
   */
  private static getAffiliateLink(product: Product): string | undefined {
    // In production, this would map to actual affiliate networks
    // For now, generate example links

    const baseUrls: Record<string, string> = {
      'Amazon': `https://amazon.com/dp/${product.upc}?tag=sugarflag-20`,
      'Walmart': `https://walmart.com/ip/${product.upc}?affcamid=sugarflag`,
      'Target': `https://target.com/p/-/A-${product.upc}?aflt=sugarflag`,
    }

    // Return first available affiliate link
    return baseUrls['Amazon'] // Default to Amazon
  }
}

/**
 * Generate smart cart based on user's typical purchases
 */
export async function generateSmartCart(userId: string) {
  const recommendations = await RecommendationEngine.getRecommendations({
    userId,
    limit: 10,
  })

  // Group by category (would need category field in Product model)
  const items = recommendations.map((product) => ({
    productId: product.id,
    upc: product.upc,
    name: product.name,
    brand: product.brand,
    quantity: 1,
    price: 4.99, // Would come from pricing API
    reason: product.reason,
    sugarSavings: (15 - (product.addedSugars || 0)) * 2,
    affiliateLink: product.affiliateLink,
  }))

  return items
}

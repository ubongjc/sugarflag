import axios from 'axios'
import { circuitBreakers, retryWithBackoff } from './retry'

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2'

export interface OpenFoodFactsProduct {
  code: string
  product_name?: string
  brands?: string
  ingredients_text?: string
  nutriments?: {
    'energy-kcal_100g'?: number
    'sugars_100g'?: number
    'carbohydrates_100g'?: number
    'proteins_100g'?: number
    'fat_100g'?: number
    'sodium_100g'?: number
    'fiber_100g'?: number
  }
  serving_size?: string
  categories?: string
}

export interface OpenFoodFactsResponse {
  status: number
  code: string
  product?: OpenFoodFactsProduct
}

/**
 * Look up product by UPC/EAN barcode from OpenFoodFacts database
 */
export async function lookupProductByUPC(
  upc: string
): Promise<OpenFoodFactsProduct | null> {
  try {
    const response = await circuitBreakers.openfoodfacts.execute(() =>
      retryWithBackoff(
        () => axios.get<OpenFoodFactsResponse>(
          `${OFF_API_BASE}/product/${upc}`,
          {
            headers: {
              'User-Agent': 'SugarFlag - nutrition analysis app',
            },
            timeout: 10000,
          }
        ),
        {
          maxRetries: 2,
          initialDelay: 1000,
        }
      )
    )

    if (response.data.status === 1 && response.data.product) {
      return response.data.product
    }

    return null
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null
      }
      console.error('OpenFoodFacts API error:', error.message)
    }
    throw new Error('Failed to lookup product in OpenFoodFacts')
  }
}

/**
 * Search for products by name
 */
export async function searchProducts(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<OpenFoodFactsProduct[]> {
  try {
    const response = await circuitBreakers.openfoodfacts.execute(() =>
      retryWithBackoff(
        () => axios.get(`${OFF_API_BASE}/search`, {
      params: {
        search_terms: query,
        page,
        page_size: pageSize,
        fields:
          'code,product_name,brands,ingredients_text,nutriments,serving_size',
      },
      headers: {
        'User-Agent': 'SugarFlag - nutrition analysis app',
      },
      timeout: 10000,
        }),
        {
          maxRetries: 2,
          initialDelay: 1000,
        }
      )
    )

    return response.data.products || []
  } catch (error) {
    console.error('OpenFoodFacts search error:', error)
    return []
  }
}

/**
 * Convert OpenFoodFacts product to our Product format
 */
export function convertToOurFormat(offProduct: OpenFoodFactsProduct) {
  const nutriments = offProduct.nutriments || {}

  return {
    upc: offProduct.code,
    brand: offProduct.brands || 'Unknown Brand',
    name: offProduct.product_name || 'Unknown Product',
    description: offProduct.categories || undefined,
    servingSize: offProduct.serving_size || undefined,
    calories: nutriments['energy-kcal_100g']
      ? Math.round(nutriments['energy-kcal_100g'])
      : undefined,
    totalSugars: nutriments['sugars_100g'] || undefined,
    addedSugars: undefined, // OpenFoodFacts doesn't always have this
    totalCarbs: nutriments['carbohydrates_100g'] || undefined,
    protein: nutriments['proteins_100g'] || undefined,
    fat: nutriments['fat_100g'] || undefined,
    sodium: nutriments['sodium_100g']
      ? nutriments['sodium_100g'] * 1000
      : undefined, // Convert g to mg
    fiber: nutriments['fiber_100g'] || undefined,
    ingredients: offProduct.ingredients_text || undefined,
  }
}

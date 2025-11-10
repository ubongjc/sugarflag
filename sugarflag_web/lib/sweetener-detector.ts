import { prisma } from './prisma'
import { Sweetener } from '@prisma/client'

/**
 * Detect sweeteners in an ingredients list
 */
export async function detectSweeteners(
  ingredients: string
): Promise<Array<{ sweetener: Sweetener; position: number }>> {
  if (!ingredients) {
    return []
  }

  // Get all sweeteners from database
  const sweeteners = await prisma.sweetener.findMany()

  // Split ingredients into array
  const ingredientList = ingredients
    .split(/,|;/)
    .map((ing) => ing.trim().toLowerCase())

  const detected: Array<{ sweetener: Sweetener; position: number }> = []

  // Check each sweetener and its aliases
  for (const sweetener of sweeteners) {
    const allNames = [sweetener.name, ...sweetener.aliases].map((n) =>
      n.toLowerCase()
    )

    for (let i = 0; i < ingredientList.length; i++) {
      const ingredient = ingredientList[i]

      // Check if this ingredient matches any sweetener name/alias
      const matched = allNames.some((name) => {
        // Check for exact match or if ingredient contains the sweetener name
        return (
          ingredient === name ||
          ingredient.includes(name) ||
          name.includes(ingredient)
        )
      })

      if (matched) {
        detected.push({
          sweetener,
          position: i + 1, // 1-indexed position
        })
        break // Don't match the same sweetener multiple times
      }
    }
  }

  // Sort by position
  return detected.sort((a, b) => a.position - b.position)
}

/**
 * Analyze ingredients text using AI to extract sweeteners with better accuracy
 */
export async function analyzeSweetenersWithAI(
  ingredients: string
): Promise<string[]> {
  // For now, use the simple detection
  // This could be enhanced with OpenAI to better identify sweeteners
  const detected = await detectSweeteners(ingredients)
  return detected.map((d) => d.sweetener.name)
}

/**
 * Get sweetener by name (case insensitive)
 */
export async function getSweetenerByName(
  name: string
): Promise<Sweetener | null> {
  const sweeteners = await prisma.sweetener.findMany()

  return (
    sweeteners.find((s) => {
      const allNames = [s.name, ...s.aliases].map((n) => n.toLowerCase())
      return allNames.includes(name.toLowerCase())
    }) || null
  )
}

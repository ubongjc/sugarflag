import { prisma } from './prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
})

/**
 * AI Meal Planning Service
 * Generates personalized meal plans and recipes
 */

export interface MealPlanOptions {
  userId: string
  days: number
  dietaryRestrictions?: string[]
  preferences?: string[]
  maxSugarPerDay?: number
  calorieTarget?: number
}

/**
 * Generate AI meal plan using user's scan history and preferences
 */
export async function generateAIMealPlan(
  options: MealPlanOptions
): Promise<any> {
  const { userId, days, dietaryRestrictions, maxSugarPerDay, calorieTarget } = options

  // Get user's preferences and scan history
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      preferences: true,
      scans: {
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
        },
      },
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Build context for AI
  const scanHistory = user.scans
    .filter((s) => s.product)
    .map((s) => ({
      product: s.product?.name,
      brand: s.product?.brand,
      score: s.score,
      totalSugars: s.product?.totalSugars,
      addedSugars: s.product?.addedSugars,
    }))

  const userPreferences = user.preferences
  const restrictions = dietaryRestrictions || userPreferences?.dietaryRestrictions || []

  // Call OpenAI GPT-4 for meal planning
  const prompt = `Generate a ${days}-day low-sugar meal plan.

User Profile:
- Dietary restrictions: ${restrictions.join(', ') || 'None'}
- Max sugar per day: ${maxSugarPerDay || 25}g
- Calorie target: ${calorieTarget || 2000} calories
- Recently scanned products: ${scanHistory.slice(0, 10).map(s => s.product).join(', ')}

Requirements:
- Each day should have breakfast, lunch, dinner, and 2 snacks
- Focus on low added sugar (<5g per meal)
- Include variety of cuisines
- Provide detailed recipes with ingredients and instructions
- Calculate nutrition per meal

Return JSON format:
{
  "days": [
    {
      "date": "2025-11-10",
      "meals": [
        {
          "type": "breakfast",
          "name": "Avocado Toast with Eggs",
          "description": "Whole grain toast topped with mashed avocado and poached eggs",
          "prepTime": 10,
          "cookTime": 5,
          "ingredients": [
            {"name": "Whole grain bread", "amount": "2", "unit": "slices"},
            {"name": "Avocado", "amount": "1", "unit": "whole"}
          ],
          "instructions": ["Step 1...", "Step 2..."],
          "nutrition": {
            "calories": 350,
            "protein": 18,
            "carbs": 32,
            "fat": 18,
            "sugar": 3,
            "addedSugar": 0
          }
        }
      ],
      "dailyTotals": {
        "calories": 1950,
        "sugar": 22,
        "addedSugar": 8
      }
    }
  ]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a nutritionist specializing in low-sugar meal planning. Create detailed, practical meal plans.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const mealPlanData = JSON.parse(response.choices[0].message.content || '{}')

  // Save meal plan to database
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + days)

  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId,
      name: `AI Meal Plan - ${startDate.toLocaleDateString()}`,
      startDate,
      endDate,
      meals: mealPlanData,
    },
  })

  return {
    id: mealPlan.id,
    ...mealPlanData,
  }
}

/**
 * Get recipe suggestions based on scan history
 */
export async function getRecipeSuggestions(
  userId: string,
  count: number = 5
): Promise<any[]> {
  // Get user's highly-rated products
  const scans = await prisma.scan.findMany({
    where: {
      userId,
      score: { gte: 70 }, // High-scoring products
    },
    include: { product: true },
    take: 20,
    orderBy: { createdAt: 'desc' },
  })

  const favoriteIngredients = scans
    .filter((s) => s.product)
    .map((s) => s.product!.name)
    .slice(0, 10)

  // Call OpenAI for recipe suggestions
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a recipe creator specializing in low-sugar, healthy meals.',
      },
      {
        role: 'user',
        content: `Suggest ${count} low-sugar recipes using these ingredients: ${favoriteIngredients.join(', ')}. Return as JSON array with name, description, prepTime, ingredients, instructions, and nutrition.`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const recipesData = JSON.parse(response.choices[0].message.content || '{"recipes": []}')

  return recipesData.recipes || []
}

/**
 * Analyze recipe and calculate sugar score
 */
export async function analyzeRecipe(recipe: {
  ingredients: Array<{ name: string; amount: string; unit: string }>
  servings: number
}): Promise<{
  sugarScore: number
  nutrition: any
  warnings: string[]
}> {
  // Call OpenAI to analyze ingredients
  const ingredientsList = recipe.ingredients
    .map((i) => `${i.amount} ${i.unit} ${i.name}`)
    .join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a nutrition analyzer. Calculate total nutrition and sugar content for recipes.',
      },
      {
        role: 'user',
        content: `Analyze this recipe for ${recipe.servings} servings:\n\nIngredients:\n${ingredientsList}\n\nReturn JSON with: {"nutrition": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "sugar": 0, "addedSugar": 0}, "sugarScore": 0-100, "warnings": []}`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface NutritionInfo {
  servingSize?: string
  calories?: number
  totalSugars?: number
  addedSugars?: number
  totalCarbs?: number
  protein?: number
  fat?: number
  sodium?: number
  fiber?: number
  ingredients?: string
}

export interface OCRResult {
  nutrition: NutritionInfo
  confidence: number
  rawText: string
}

/**
 * Extract nutrition information from a nutrition label image using OpenAI Vision API
 */
export async function extractNutritionFromImage(
  imageBase64: string
): Promise<OCRResult> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a nutrition label OCR assistant. Extract all nutrition information from the image and return it as JSON.

Focus on:
- Serving size
- Calories
- Total sugars (grams)
- Added sugars (grams) if available
- Total carbohydrates (grams)
- Protein (grams)
- Fat (grams)
- Sodium (mg)
- Fiber (grams)
- Ingredients list

Return JSON in this exact format:
{
  "nutrition": {
    "servingSize": "string",
    "calories": number,
    "totalSugars": number,
    "addedSugars": number,
    "totalCarbs": number,
    "protein": number,
    "fat": number,
    "sodium": number,
    "fiber": number,
    "ingredients": "string"
  },
  "confidence": number (0-1),
  "rawText": "raw OCR text"
}

If a field cannot be determined, omit it from the response. Confidence should be 0-1 based on image quality.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract nutrition information from this label:',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    const result = JSON.parse(content) as OCRResult

    // Validate the response structure
    if (!result.nutrition) {
      throw new Error('Invalid OCR response structure')
    }

    return result
  } catch (error) {
    console.error('OCR error:', error)
    throw new Error(
      `Failed to extract nutrition information: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Extract ingredients list specifically from an image
 */
export async function extractIngredientsFromImage(
  imageBase64: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Extract the complete ingredients list from this product label. Return only the ingredients as a comma-separated list, preserving the original order.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract the ingredients list:',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    return content.trim()
  } catch (error) {
    console.error('Ingredients extraction error:', error)
    throw new Error(
      `Failed to extract ingredients: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

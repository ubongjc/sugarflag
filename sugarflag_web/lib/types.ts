import { z } from 'zod'

// Scan request/response types
export const ScanRequestSchema = z.object({
  upc: z.string().optional(),
  photo: z.string().optional(), // base64 encoded
  locale: z.string().default('en-US'),
})

export type ScanRequest = z.infer<typeof ScanRequestSchema>

export const SweetenerInfoSchema = z.object({
  name: z.string(),
  type: z.enum(['added_sugar', 'artificial', 'natural_alternative']),
  position: z.number(),
  healthScore: z.number().min(0).max(100),
})

export type SweetenerInfo = z.infer<typeof SweetenerInfoSchema>

export const ScanResponseSchema = z.object({
  scanId: z.string(),
  score: z.number().min(0).max(100),
  sweeteners: z.array(SweetenerInfoSchema),
  rationale: z.string(),
  uncertainty: z.number().min(0).max(1).optional(),
  product: z.object({
    upc: z.string(),
    name: z.string(),
    brand: z.string(),
    totalSugars: z.number().optional(),
    addedSugars: z.number().optional(),
    servingSize: z.string().optional(),
  }).optional(),
})

export type ScanResponse = z.infer<typeof ScanResponseSchema>

// Product types
export const ProductResponseSchema = z.object({
  id: z.string(),
  upc: z.string(),
  name: z.string(),
  brand: z.string(),
  description: z.string().optional(),
  nutrients: z.object({
    servingSize: z.string().optional(),
    calories: z.number().optional(),
    totalSugars: z.number().optional(),
    addedSugars: z.number().optional(),
    totalCarbs: z.number().optional(),
    protein: z.number().optional(),
    fat: z.number().optional(),
    sodium: z.number().optional(),
    fiber: z.number().optional(),
  }),
  ingredients: z.string().optional(),
  sweeteners: z.array(SweetenerInfoSchema),
})

export type ProductResponse = z.infer<typeof ProductResponseSchema>

// Cart suggestion types
export const CartItemSchema = z.object({
  productId: z.string(),
  upc: z.string(),
  name: z.string(),
  brand: z.string(),
  quantity: z.number(),
  price: z.number().optional(),
  reason: z.string(),
  sugarSavings: z.number().optional(),
})

export type CartItem = z.infer<typeof CartItemSchema>

export const CartSuggestionResponseSchema = z.object({
  id: z.string(),
  weekOf: z.string(),
  items: z.array(CartItemSchema),
  estSavings: z.number().optional(),
  totalCost: z.number().optional(),
  generatedAt: z.string(),
})

export type CartSuggestionResponse = z.infer<typeof CartSuggestionResponseSchema>

// Error response
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.any().optional(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

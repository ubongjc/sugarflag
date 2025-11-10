import { auth, currentUser } from '@clerk/nextjs'
import { NextRequest } from 'next/server'

/**
 * Get the authenticated user ID from Clerk
 * Throws if user is not authenticated
 */
export async function requireAuth() {
  const { userId } = auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  return userId
}

/**
 * Get the authenticated user ID or null
 */
export async function getAuthUserId() {
  const { userId } = auth()
  return userId
}

/**
 * Get full user details from Clerk
 */
export async function getAuthUser() {
  const user = await currentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    imageUrl: user.imageUrl,
  }
}

/**
 * Extract user ID from request (for API routes)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string> {
  const userId = await requireAuth()
  return userId
}

import { authMiddleware } from '@clerk/nextjs'

// This middleware protects all routes by default
// Public routes are explicitly listed
export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/health',
    '/api/webhooks/stripe',
    '/pricing',
    '/privacy',
    '/terms',
    '/sign-in(.*)',
    '/sign-up(.*)',
  ],
  // Routes that require authentication but allow unauthenticated access for now
  ignoredRoutes: [],
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}

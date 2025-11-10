import posthog from 'posthog-js'

export const initAnalytics = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
    })
  }
}

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties)
  }
}

// Predefined events for consistency
export const analytics = {
  // User events
  userSignedUp: (userId: string) => {
    trackEvent('user_signed_up', { userId })
  },
  userSignedIn: (userId: string) => {
    trackEvent('user_signed_in', { userId })
  },

  // Scan events
  scanStarted: (scanType: 'upc' | 'photo') => {
    trackEvent('scan_started', { scanType })
  },
  scanCompleted: (score: number, scanType: 'upc' | 'photo', productName?: string) => {
    trackEvent('scan_completed', { score, scanType, productName })
  },
  scanFailed: (error: string, scanType: 'upc' | 'photo') => {
    trackEvent('scan_failed', { error, scanType })
  },

  // Cart events
  cartViewed: () => {
    trackEvent('cart_viewed')
  },
  cartGenerated: (itemCount: number, sugarSavings: number) => {
    trackEvent('cart_generated', { itemCount, sugarSavings })
  },
  cartExported: () => {
    trackEvent('cart_exported')
  },

  // Product events
  productSearched: (query: string, resultCount: number) => {
    trackEvent('product_searched', { query, resultCount })
  },
  productViewed: (productUpc: string, productName: string) => {
    trackEvent('product_viewed', { productUpc, productName })
  },

  // Feedback events
  feedbackSubmitted: (thumbsUp: boolean, scanId: string) => {
    trackEvent('feedback_submitted', { thumbsUp, scanId })
  },

  // Subscription events
  subscribeClicked: (plan: string) => {
    trackEvent('subscribe_clicked', { plan })
  },
  subscriptionCompleted: (plan: string, price: number) => {
    trackEvent('subscription_completed', { plan, price })
  },
  subscriptionCanceled: () => {
    trackEvent('subscription_canceled')
  },

  // Onboarding
  onboardingStarted: () => {
    trackEvent('onboarding_started')
  },
  onboardingCompleted: () => {
    trackEvent('onboarding_completed')
  },
  preferencesUpdated: (preferences: Record<string, any>) => {
    trackEvent('preferences_updated', preferences)
  },

  // Sharing
  scanShared: (platform: string) => {
    trackEvent('scan_shared', { platform })
  },

  // Errors
  errorOccurred: (errorType: string, errorMessage: string, context?: string) => {
    trackEvent('error_occurred', { errorType, errorMessage, context })
  },
}

// User identification
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, traits)
  }
}

// Reset on logout
export const resetAnalytics = () => {
  if (typeof window !== 'undefined') {
    posthog.reset()
  }
}

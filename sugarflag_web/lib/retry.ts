/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number
  initialDelay: number // milliseconds
  maxDelay: number // milliseconds
  backoffMultiplier: number
  retryableStatuses?: number[] // HTTP status codes that should trigger retry
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay
 */
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1)
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay
  return Math.min(delay + jitter, config.maxDelay)
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= fullConfig.maxRetries + 1; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry if this is the last attempt
      if (attempt > fullConfig.maxRetries) {
        break
      }

      // Check if error is retryable
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status
        if (
          fullConfig.retryableStatuses &&
          !fullConfig.retryableStatuses.includes(status)
        ) {
          // Non-retryable error
          throw error
        }
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, fullConfig)
      console.warn(
        `Attempt ${attempt} failed, retrying in ${delay}ms:`,
        error instanceof Error ? error.message : error
      )
      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Circuit breaker states
 */
enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, rejecting requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening
  successThreshold: number // Number of successes to close from half-open
  timeout: number // Time to wait before trying again (ms)
}

/**
 * Circuit breaker for external service calls
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount = 0
  private successCount = 0
  private nextAttempt = Date.now()

  constructor(
    private name: string,
    private config: CircuitBreakerConfig
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(
          `Circuit breaker [${this.name}] is OPEN. Service temporarily unavailable.`
        )
      }
      // Time to try again
      this.state = CircuitState.HALF_OPEN
      this.successCount = 0
    }

    try {
      const result = await fn()

      // Success - record it
      this.onSuccess()
      return result
    } catch (error) {
      // Failure - record it
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failureCount = 0

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= this.config.successThreshold) {
        console.log(`Circuit breaker [${this.name}] closing - service recovered`)
        this.state = CircuitState.CLOSED
      }
    }
  }

  private onFailure(): void {
    this.failureCount++

    if (
      this.state === CircuitState.HALF_OPEN ||
      this.failureCount >= this.config.failureThreshold
    ) {
      console.error(
        `Circuit breaker [${this.name}] opening - service failing`
      )
      this.state = CircuitState.OPEN
      this.nextAttempt = Date.now() + this.config.timeout
    }
  }

  getState(): CircuitState {
    return this.state
  }

  reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.nextAttempt = Date.now()
  }
}

/**
 * Circuit breakers for external services
 */
export const circuitBreakers = {
  openai: new CircuitBreaker('OpenAI', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
  }),
  openfoodfacts: new CircuitBreaker('OpenFoodFacts', {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000, // 30 seconds
  }),
  stripe: new CircuitBreaker('Stripe', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
  }),
}

/**
 * Wrapper for fetch with retry and circuit breaker
 */
export async function resilientFetch(
  url: string,
  options: RequestInit = {},
  config?: {
    retry?: Partial<RetryConfig>
    circuitBreaker?: CircuitBreaker
  }
): Promise<Response> {
  const fetchFn = async () => {
    const response = await fetch(url, options)

    // Throw for non-OK responses to trigger retry
    if (!response.ok) {
      const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`)
      error.status = response.status
      error.response = response
      throw error
    }

    return response
  }

  // Apply circuit breaker if provided
  const circuitBreakerFn = config?.circuitBreaker
    ? () => config.circuitBreaker!.execute(fetchFn)
    : fetchFn

  // Apply retry with backoff
  return retryWithBackoff(circuitBreakerFn, config?.retry)
}

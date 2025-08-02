/**
 * Retry utility for handling transient failures
 */
export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffFactor?: number;
  maxDelayMs?: number;
  retryCondition?: (error: any) => boolean;
}

const defaultRetryCondition = (error: any): boolean => {
  // Retry on network errors, timeouts, and 5xx server errors
  if (
    error.code === "ECONNABORTED" ||
    error.code === "ENOTFOUND" ||
    error.code === "ECONNREFUSED"
  ) {
    return true;
  }

  if (error.response && error.response.status >= 500) {
    return true;
  }

  // Retry on rate limiting (429)
  if (error.response && error.response.status === 429) {
    return true;
  }

  return false;
};

export const retry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  const {
    maxAttempts,
    delayMs,
    backoffFactor = 2,
    maxDelayMs = 30000,
    retryCondition = defaultRetryCondition,
  } = options;

  let lastError: any;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt or if retry condition is not met
      if (attempt === maxAttempts || !retryCondition(error)) {
        throw error;
      }

      console.log(
        `🔄 Retry attempt ${attempt}/${maxAttempts} failed, retrying in ${currentDelay}ms:`,
        (error as any)?.message ?? String(error)
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      // Increase delay for next attempt (exponential backoff)
      currentDelay = Math.min(currentDelay * backoffFactor, maxDelayMs);
    }
  }

  throw lastError;
};

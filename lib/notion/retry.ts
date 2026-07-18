import {
  APIErrorCode,
  ClientErrorCode,
  isNotionClientError,
} from "@notionhq/client";

const RETRYABLE_CODES = new Set([
  APIErrorCode.RateLimited,
  APIErrorCode.InternalServerError,
  APIErrorCode.ServiceUnavailable,
  ClientErrorCode.RequestTimeout,
  ClientErrorCode.ResponseError,
]);

export type RetryOptions = {
  attempts?: number;
  baseDelayMs?: number;
  sleep?: (milliseconds: number) => Promise<void>;
};

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

function isRetryable(error: unknown): boolean {
  if (isNotionClientError(error)) return RETRYABLE_CODES.has(error.code);
  return error instanceof TypeError;
}

function retryAfterMs(error: unknown): number | null {
  if (!isNotionClientError(error) || !("headers" in error)) return null;
  const headers = error.headers as { get(name: string): string | null };
  const value = headers.get("retry-after");
  if (!value) return null;
  const seconds = Number(value);
  return Number.isFinite(seconds) ? seconds * 1000 : null;
}

export async function withNotionRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 250;
  const wait = options.sleep ?? sleep;

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= attempts - 1 || !isRetryable(error)) throw error;
      const requestedDelay = retryAfterMs(error);
      const delay =
        requestedDelay ?? Math.min(baseDelayMs * 2 ** attempt, 2_000);
      await wait(delay);
    }
  }
}

export function createConcurrencyLimit(limit: number) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Concurrency limit must be a positive integer");
  }

  let active = 0;
  const queue: Array<() => void> = [];

  return async function run<T>(operation: () => Promise<T>): Promise<T> {
    if (active >= limit) {
      await new Promise<void>((resolve) => queue.push(resolve));
    }

    active += 1;
    try {
      return await operation();
    } finally {
      active -= 1;
      queue.shift()?.();
    }
  };
}

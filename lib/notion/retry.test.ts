import { expect, test } from "bun:test";
import { APIErrorCode, APIResponseError } from "@notionhq/client";
import { createConcurrencyLimit, withNotionRetry } from "./retry";

test("retries transient failures with bounded backoff", async () => {
  let calls = 0;
  const delays: number[] = [];

  const result = await withNotionRetry(
    async () => {
      calls += 1;
      if (calls < 3) throw new TypeError("network unavailable");
      return "ok";
    },
    {
      attempts: 3,
      baseDelayMs: 10,
      sleep: async (milliseconds) => {
        delays.push(milliseconds);
      },
    },
  );

  expect(result).toBe("ok");
  expect(calls).toBe(3);
  expect(delays).toEqual([10, 20]);
});

test("honors Notion retry-after headers", async () => {
  const failure = new APIResponseError({
    code: APIErrorCode.RateLimited,
    status: 429,
    message: "slow down",
    headers: new Headers({ "retry-after": "1" }),
    rawBodyText: "",
  });
  const delays: number[] = [];
  let calls = 0;

  await expect(
    withNotionRetry(
      async () => {
        calls += 1;
        throw failure;
      },
      {
        attempts: 2,
        sleep: async (milliseconds) => {
          delays.push(milliseconds);
        },
      },
    ),
  ).rejects.toBe(failure);

  expect(calls).toBe(2);
  expect(delays).toEqual([1000]);
});

test("does not retry non-transient Notion failures", async () => {
  const failure = new Error("invalid data");
  let calls = 0;

  await expect(
    withNotionRetry(async () => {
      calls += 1;
      throw failure;
    }),
  ).rejects.toBe(failure);
  expect(calls).toBe(1);
});

test("bounds concurrent operations", async () => {
  const limit = createConcurrencyLimit(2);
  let active = 0;
  let peak = 0;
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  const jobs = Array.from({ length: 4 }, () =>
    limit(async () => {
      active += 1;
      peak = Math.max(peak, active);
      await gate;
      active -= 1;
    }),
  );

  await Promise.resolve();
  expect(active).toBe(2);
  release();
  await Promise.all(jobs);

  expect(peak).toBe(2);
});

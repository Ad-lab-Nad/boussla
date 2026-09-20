import { Prisma, PrismaClient } from "@prisma/client";

const RETRYABLE_MESSAGE_PATTERNS = [
  /can't reach database server/i,
  /connection terminated/i,
  /connection reset/i,
  /timed? ?out/i,
];

function isRetryableConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Error) {
    return RETRYABLE_MESSAGE_PATTERNS.some((pattern) => pattern.test(error.message));
  }
  return false;
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Supabase's connection pooler occasionally fails a connection attempt for
  // a moment — observed directly during development, where a plain TCP retry
  // a few hundred ms later succeeds most of the time. Retrying only
  // transient connection failures here (never a real query error, so this
  // never masks an actual bug) covers every call in the app without
  // touching each query/action site individually.
  return client.$extends({
    name: "retry-transient-connection-errors",
    query: {
      async $allOperations({ args, query }) {
        const maxAttempts = 3;
        let lastError: unknown;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            return await query(args);
          } catch (error) {
            lastError = error;
            if (!isRetryableConnectionError(error) || attempt === maxAttempts) throw error;
            await new Promise((resolve) => setTimeout(resolve, attempt * 200));
          }
        }
        throw lastError;
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Evict any stale client instance cached in globalThis from previous hot reloads
if (globalForPrisma.prisma) {
  try {
    (globalForPrisma.prisma as any).$disconnect?.();
  } catch (e) {
    // Ignore cleanup errors
  }
  globalForPrisma.prisma = undefined;
}

let prismaInstance: PrismaClient | undefined;

const getPrisma = (): PrismaClient => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  if (!prismaInstance) {
    const connectionString = process.env.DATABASE_URL?.trim();
    if (!connectionString) {
      throw new Error("DATABASE_URL is not defined in the environment variables");
    }

    const pool = new pg.Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    const adapter = new PrismaPg(pool);

    prismaInstance = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }
  }
  return prismaInstance;
};

// Export db as a lazy initialization proxy
export const db = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export async function withDbRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isConnectionError = 
      errorMsg.includes("Can't reach database server") ||
      errorMsg.includes("Connection terminated") ||
      errorMsg.includes("timeout") ||
      errorMsg.includes("disconnected") ||
      errorMsg.includes("database");
      
    if (isConnectionError && retries > 0) {
      console.warn(`[DB Retry] Connection error detected. Retrying in ${delay}ms... (${retries} left). Error: ${errorMsg}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withDbRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

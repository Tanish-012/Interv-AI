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

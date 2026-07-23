import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || "";

  const url = databaseUrl.includes("?")
    ? `${databaseUrl}&connection_limit=1`
    : `${databaseUrl}?connection_limit=1`;

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : ["error"],
    datasources: {
      db: { url },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

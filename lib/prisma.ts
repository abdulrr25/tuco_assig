import { PrismaClient } from "@prisma/client";

declare const process: { env: Record<string, string | undefined> };

// Prevent multiple instances in Next.js dev (hot reload creates new instances)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient;
};

function getPrismaClient() {
    if (globalForPrisma.prisma) {
        return globalForPrisma.prisma;
    }

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL is not defined in environment variables');
    }


    const prisma = new PrismaClient({
        datasourceUrl: connectionString,
        log: ["warn", "error"],
    });

    if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prisma;
    }

    return prisma;
}

export const prisma = getPrismaClient();

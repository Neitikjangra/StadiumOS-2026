import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, any> = {};

  // Check DATABASE_URL exists
  const dbUrl = process.env.DATABASE_URL || "";
  results.databaseUrl = {
    exists: !!dbUrl,
    host: dbUrl.includes("@") ? dbUrl.split("@")[1]?.split(":")[0] : "unknown",
    hasPgbouncer: dbUrl.includes("pgbouncer=true"),
    hasConnectionLimit: dbUrl.includes("connection_limit"),
    urlPrefix: dbUrl.substring(0, 40) + "...",
  };

  // Try Prisma connection
  try {
    const { prisma } = await import("@/lib/prisma");
    const start = Date.now();

    const [stadiumCount, incidentCount, matchCount, gateCount, snapshotCount] = await Promise.all([
      prisma.stadium.count().catch((e: any) => ({ error: e.message })),
      prisma.incident.count().catch((e: any) => ({ error: e.message })),
      prisma.match.count().catch((e: any) => ({ error: e.message })),
      prisma.gate.count().catch((e: any) => ({ error: e.message })),
      prisma.queueSnapshot.count().catch((e: any) => ({ error: e.message })),
    ]);

    results.connection = {
      status: "ok",
      latencyMs: Date.now() - start,
    };
    results.counts = {
      stadiums: stadiumCount,
      incidents: incidentCount,
      matches: matchCount,
      gates: gateCount,
      queueSnapshots: snapshotCount,
    };
  } catch (e: any) {
    results.connection = {
      status: "failed",
      error: e.message,
    };
  }

  results.env = {
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    AUTH_SECRET: process.env.AUTH_SECRET ? "set (hidden)" : "NOT SET",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set (hidden)" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json(results, {
    headers: { "Cache-Control": "no-store" },
  });
}

import "dotenv/config";
import { ingestionWorker, invalidateDetector } from "./processors/ingestion-processor";
import { broadcastWorker } from "./processors/broadcast-processor";
import { prisma } from "./prisma-client";

console.log("\n🔄 StadiumOS 2026 — Event Ingestion Worker\n");
console.log(`   Redis: ${process.env.REDIS_URL ?? "redis://localhost:6379"}`);
console.log(`   Concurrency: 10`);
console.log(`   Retry: 3 attempts, exponential backoff\n`);

// Periodic stale device check (every 60s)
setInterval(async () => {
  try {
    const staleThreshold = new Date(Date.now() - 15 * 60 * 1000);
    const devices = await prisma.deviceStatusRecord.findMany({
      where: {
        lastSeen: { lt: staleThreshold },
        status: { not: "offline" },
      },
    });

    for (const device of devices) {
      await prisma.deviceStatusRecord.update({
        where: { id: device.id },
        data: { status: "offline" },
      });
    }

    if (devices.length > 0) {
      console.log(`[HEARTBEAT] Marked ${devices.length} devices as offline`);
    }
  } catch (err) {
    console.error("[HEARTBEAT] Error checking stale devices:", err);
  }
}, 60_000);

// Graceful shutdown
async function shutdown() {
  console.log("\n🛑 Shutting down workers...");
  await ingestionWorker.close();
  await broadcastWorker.close();
  await prisma.$disconnect();
  console.log("✅ Workers stopped.\n");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("✅ Workers started. Listening for events...\n");

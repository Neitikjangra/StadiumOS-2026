#!/usr/bin/env node
/**
 * Reports the tracked git repository size in MB.
 * Warns if approaching the 10 MB submission threshold.
 */
const { execSync } = require("child_process");
const path = require("path");

const THRESHOLD_MB = 10;
const WARN_MB = 8;

try {
  const root = path.resolve(__dirname, "..");
  const sizeBytes = parseInt(
    execSync("git count-objects -v", { cwd: root, encoding: "utf8" })
      .split("\n")
      .find((l) => l.startsWith("size-pack:"))
      ?.split(":")[1]
      ?.trim() || "0"
  );
  const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

  console.log(`\n  Repository size: ${sizeMB} MB (pack)`);

  if (parseFloat(sizeMB) >= THRESHOLD_MB) {
    console.error(`  ❌ EXCEEDS ${THRESHOLD_MB} MB threshold!`);
    process.exit(1);
  } else if (parseFloat(sizeMB) >= WARN_MB) {
    console.warn(`  ⚠️  Approaching ${THRESHOLD_MB} MB threshold`);
  } else {
    console.log(`  ✅ Under ${THRESHOLD_MB} MB limit`);
  }
} catch (err) {
  console.error("  Could not determine repo size:", err.message);
  process.exit(1);
}

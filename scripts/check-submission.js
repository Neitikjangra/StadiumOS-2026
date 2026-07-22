#!/usr/bin/env node
/**
 * Submission readiness checker.
 * Verifies all mandatory rules before code submission.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appRoot = path.join(root, "apps", "web");
let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    const result = fn();
    if (result === true || result === "skip") {
      console.log(`  ✅ ${label}`);
      passed++;
    } else {
      console.log(`  ❌ ${label}: ${result}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ ${label}: ${err.message}`);
    failed++;
  }
}

console.log("\n  StadiumOS 2026 — Submission Check\n");

// 1. Only one local branch
check("Single branch only", () => {
  const branches = execSync("git branch --list", { cwd: root, encoding: "utf8" })
    .trim()
    .split("\n")
    .filter((b) => b.trim());
  return branches.length <= 1 || `Found ${branches.length} branches: ${branches.join(", ")}`;
});

// 2. README exists
check("README.md exists", () => {
  return fs.existsSync(path.join(root, "README.md")) || "README.md not found";
});

// 3. No forbidden large directories tracked
check("No node_modules tracked", () => {
  try {
    const tracked = execSync("git ls-files node_modules/", { cwd: root, encoding: "utf8" }).trim();
    return tracked.length === 0 || `node_modules is tracked: ${tracked.split("\n").length} files`;
  } catch {
    return true;
  }
});

check("No .next/ tracked", () => {
  try {
    const tracked = execSync("git ls-files apps/web/.next/", { cwd: root, encoding: "utf8" }).trim();
    return tracked.length === 0 || ".next/ is tracked";
  } catch {
    return true;
  }
});

// 4. No file above 2 MB
check("No file above 2 MB", () => {
  const large = execSync("git ls-files --cached", { cwd: root, encoding: "utf8" })
    .trim()
    .split("\n")
    .filter((f) => {
      try {
        const stat = fs.statSync(path.join(root, f));
        return stat.size > 2 * 1024 * 1024;
      } catch {
        return false;
      }
    });
  return large.length === 0 || `Large files: ${large.join(", ")}`;
});

// 5. .env.example exists
check(".env.example exists", () => {
  return fs.existsSync(path.join(appRoot, ".env.example")) || ".env.example not found";
});

// 6. Tests command present
check("Test scripts defined", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(appRoot, "package.json"), "utf8"));
  return !!(pkg.scripts?.test && pkg.scripts?.lint) || "Missing test or lint scripts";
});

// 7. No hardcoded secrets
check("No hardcoded secrets", () => {
  const files = execSync("git ls-files --cached '*.ts' '*.tsx' '*.js'", { cwd: root, encoding: "utf8" })
    .trim().split("\n");
  const secrets = /(?:password|secret|api_key|apikey)\s*[:=]\s*["'][^"']{8,}/gi;
  for (const f of files) {
    try {
      const content = fs.readFileSync(path.join(root, f), "utf8");
      if (secrets.test(content)) return `Possible secret in ${f}`;
    } catch {}
  }
  return true;
});

// 8. CI workflow exists
check("GitHub Actions CI exists", () => {
  return fs.existsSync(path.join(root, ".github", "workflows", "ci.yml")) || "No CI workflow found";
});

console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.error("  ❌ Submission checks FAILED. Fix issues before submitting.\n");
  process.exit(1);
} else {
  console.log("  ✅ All submission checks PASSED.\n");
}

#!/usr/bin/env node

/**
 * Simple script to run examples directly using Node.js
 * This is helpful if tsx isn't installed
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we need to build first
if (!existsSync(join(__dirname, "../dist"))) {
  console.log("Building project first...");
  execSync("npm run build", { stdio: "inherit" });
}

// Run the example
console.log("Running basic example:");
console.log("===========================================");

try {
  // First try with tsx if available
  execSync("npx tsx examples/basic.ts", { stdio: "inherit" });
} catch (err) {
  console.log("Could not run with tsx, using node with compiled JavaScript");
  execSync("npm run build", { stdio: "inherit" });
  execSync("node dist/examples/basic.js", { stdio: "inherit" });
}

console.log("===========================================");
console.log("Example completed!");

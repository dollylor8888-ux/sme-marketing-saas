/**
 * Secret rotation helper (dry-run only).
 *
 * This script prints a rotation checklist and sample commands.
 * It does NOT call any external APIs or update providers automatically.
 */

import { randomBytes } from "node:crypto";

const envKeys = [
  "CLERK_SECRET_KEY",
  "OPENAI_API_KEY",
  "AI_PROVIDER_KEY",
  "BOSS_SECRET_KEY",
  "BOSS_HMAC_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

type EnvKey = (typeof envKeys)[number];

function mask(value: string | undefined): string {
  if (!value) return "(missing)";
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function exampleSecret(size = 32): string {
  return randomBytes(size).toString("hex");
}

function printRotationPlan(key: EnvKey): void {
  const current = process.env[key];

  console.log(`\n=== ${key} ===`);
  console.log(`current: ${mask(current)}`);
  console.log(`new (example): ${exampleSecret(24)}`);
  console.log("steps:");
  console.log("1. Generate a new secret in the provider dashboard.");
  console.log("2. Update local .env.local and deployment environment variables.");
  console.log("3. Deploy and verify health checks / key-dependent endpoints.");
  console.log("4. Revoke the old key after successful verification.");
}

function main(): void {
  console.log("Secret Rotation Dry Run");
  console.log("This script does not mutate files or remote services.");

  for (const key of envKeys) {
    printRotationPlan(key);
  }

  console.log("\nTip: rotate one provider at a time to reduce blast radius.");
}

main();

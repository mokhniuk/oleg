// Runs once when the Next.js server starts: creates the MySQL schema if missing so a
// fresh database works without a manual seed step.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureSchema } = await import("./instrumentation.node");
    // Awaited so requests are not served against a missing schema. ensureSchema never throws.
    await ensureSchema().catch((err) => console.error("[init] unexpected error", err));
  }
}

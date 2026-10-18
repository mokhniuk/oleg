// Runs once when the Next.js server starts: creates the MySQL schema if missing so a
// fresh database works without a manual seed step.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureSchema } = await import("./instrumentation.node");
    // Not awaited: the server starts accepting requests while we wait for the DB.
    void ensureSchema().catch((err) => console.error("[init] unexpected error", err));
  }
}

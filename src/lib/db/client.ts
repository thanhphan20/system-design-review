import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function getClient(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
  if (!url) {
    throw new Error("TURSO_DATABASE_URL is not set");
  }

  client = createClient({ url, authToken });
  return client;
}

async function ensureSchema(db: Client): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      mermaid_source TEXT NOT NULL,
      requirements_json TEXT NOT NULL,
      critique_text TEXT NOT NULL
    );
  `);
}

/** Returns a ready-to-query libSQL client, memoizing schema setup across calls. */
export async function getDb(): Promise<Client> {
  const db = getClient();
  if (!schemaReady) {
    schemaReady = ensureSchema(db);
  }
  await schemaReady;
  return db;
}

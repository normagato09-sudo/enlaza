import "server-only";

/**
 * Conexión a la base de datos.
 * - En Vercel: Postgres de Neon (variable DATABASE_URL, la añade Vercel Storage).
 * - En local sin DATABASE_URL: base de datos en memoria (PGlite) para poder probar.
 * Las tablas se crean solas la primera vez.
 */

type Row = Record<string, unknown>;
type Runner = (text: string, params?: unknown[]) => Promise<Row[]>;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  discord_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar TEXT,
  confirmed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_username_idx ON users (lower(username));
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  pay TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skill TEXT NOT NULL,
  lang TEXT NOT NULL,
  slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS ads_expires_idx ON ads (expires_at);
ALTER TABLE ads ADD COLUMN IF NOT EXISTS niche TEXT;

CREATE TABLE IF NOT EXISTS applications (
  ad_id TEXT NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  slot TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (ad_id, slot, user_id)
);

CREATE TABLE IF NOT EXISTS reports (
  ad_id TEXT NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (ad_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  from_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  to_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS messages_to_idx ON messages (to_id, read_at);
CREATE INDEX IF NOT EXISTS messages_pair_idx ON messages (from_id, to_id, created_at);

CREATE TABLE IF NOT EXISTS collaborations (
  id TEXT PRIMARY KEY,
  a_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  b_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS collaborations_pair_idx
  ON collaborations (LEAST(a_id, b_id), GREATEST(a_id, b_id));

CREATE TABLE IF NOT EXISTS reviews (
  collab_id TEXT NOT NULL REFERENCES collaborations(id) ON DELETE CASCADE,
  from_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  to_id TEXT NOT NULL REFERENCES users(discord_id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collab_id, from_id)
);
`;

const globalForDb = globalThis as unknown as { enlazaDb?: Promise<Runner> };

async function createRunner(): Promise<Runner> {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: 3 });
    const run: Runner = async (text, params) => (await pool.query(text, params as unknown[])).rows;
    await pool.query(SCHEMA);
    return run;
  }
  if (process.env.NODE_ENV === "production" && !process.env.ENLAZA_ALLOW_MEMORY_DB) {
    throw new Error(
      "Falta DATABASE_URL: crea la base de datos Neon en Vercel Storage y conéctala al proyecto.",
    );
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite();
  await db.exec(SCHEMA);
  return async (text, params) => (await db.query<Row>(text, params)).rows;
}

export async function query<T = Row>(text: string, params?: unknown[]): Promise<T[]> {
  if (!globalForDb.enlazaDb) {
    globalForDb.enlazaDb = createRunner().catch((e) => {
      globalForDb.enlazaDb = undefined;
      throw e;
    });
  }
  const run = await globalForDb.enlazaDb;
  return (await run(text, params)) as T[];
}

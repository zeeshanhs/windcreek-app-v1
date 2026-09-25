import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";

export function databaseFile(override = process.env.DATABASE_FILE): string {
  return path.resolve(process.cwd(), override || ".local/askpat.sqlite");
}

export function openSqlite(file = databaseFile()) {
  mkdirSync(path.dirname(file), { recursive: true });
  const client = new Database(file);
  client.pragma("foreign_keys = ON");
  client.pragma("busy_timeout = 5000");
  const db = drizzle({ client, schema });
  return { client, db, close: () => client.close() };
}

export type SqliteConnection = ReturnType<typeof openSqlite>;

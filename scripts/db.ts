import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { openSqlite } from "../lib/askpat/persistence/sqlite/connection";
import { resetBaseline, seedBaseline } from "../lib/askpat/persistence/sqlite/seed";

const command = process.argv[2];
if (!["migrate", "seed", "setup", "reset"].includes(command ?? "")) {
  throw new Error("Use migrate, seed, setup, or reset.");
}
const connection = openSqlite();
try {
  if (command === "migrate" || command === "setup") migrate(connection.db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });
  if (command === "seed" || command === "setup") seedBaseline(connection);
  if (command === "reset") resetBaseline(connection);
  console.log(`Database ${command} complete.`);
} finally {
  connection.close();
}

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./lib/askpat/persistence/sqlite/schema.ts",
  out: "./drizzle",
});

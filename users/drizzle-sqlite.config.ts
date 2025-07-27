import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: ["./src/db/schema-sqlite/*.ts"],
  out: "./drizzle-sqlite",
  dbCredentials: {
    url: "./forum_study_local.db",
  },
});

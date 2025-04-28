import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

const connectionString = process.env.POSTGRES_URL!;

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/db/schema/*.ts"],
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
});

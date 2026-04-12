import { pool } from "@workspace/db";
import { execFileSync } from "node:child_process";
import { logger } from "./lib/logger";

// @ts-ignore — bundled as text by esbuild
import seedSql from "./seed-data.sql";

export async function seedIfEmpty(): Promise<void> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT COUNT(*)::int AS n FROM articles");
    const count = rows[0]?.n ?? 0;

    if (count > 0) {
      logger.info({ count }, "Database already has data — skipping seed");
      return;
    }

    logger.info("Database is empty — seeding from dev snapshot...");

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL not set");

    execFileSync("psql", [dbUrl], {
      input: seedSql as string,
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Advance sequences past the inserted IDs so new inserts don't conflict
    await client.query(`
      SELECT setval('articles_id_seq', (SELECT MAX(id) FROM articles));
      SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
      SELECT setval('churches_id_seq', (SELECT MAX(id) FROM churches));
      SELECT setval('calendar_events_id_seq', (SELECT MAX(id) FROM calendar_events));
      SELECT setval('student_spotlight_id_seq', (SELECT MAX(id) FROM student_spotlight));
      SELECT setval('business_spotlight_id_seq', (SELECT MAX(id) FROM business_spotlight));
      SELECT setval('group_spotlight_id_seq', (SELECT MAX(id) FROM group_spotlight));
      SELECT setval('user_roles_id_seq', (SELECT MAX(id) FROM user_roles));
    `);

    logger.info("Seed complete — sequences updated");
  } finally {
    client.release();
  }
}

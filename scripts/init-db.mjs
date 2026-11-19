import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const sqlPath = path.join(process.cwd(), "prisma", "create_rethink_nutri_audits.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  // Split into statements
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements...`);

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
      console.log("Statement executed successfully.");
    } catch (err) {
      console.error("Error executing statement:", err.message);
    }
  }

  console.log("Database table initialization completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

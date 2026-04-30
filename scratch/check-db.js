import { getDb } from "../api/queries/connection";
import * as schema from "../db/schema";

async function checkUsers() {
  try {
    const db = getDb();
    const users = await db.select().from(schema.users);
    console.log("Current Users in DB:", JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("Error checking users:", e);
  } finally {
    process.exit();
  }
}

checkUsers();

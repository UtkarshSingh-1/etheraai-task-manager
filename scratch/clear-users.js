import { getDb } from "../api/queries/connection";
import * as schema from "../db/schema";

async function clearUsers() {
  try {
    const db = getDb();
    await db.delete(schema.users);
    console.log("All users removed from DB.");
  } catch (e) {
    console.error("Error removing users:", e);
  } finally {
    process.exit();
  }
}

clearUsers();

import { eq, and, gt } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function createOtp(data: {
  email: string;
  code: string;
  type: "VERIFY" | "RESET";
}) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await getDb()
    .insert(schema.otps)
    .values({
      email: data.email,
      code: data.code,
      type: data.type,
      expiresAt,
    });
}

export async function findValidOtp(email: string, code: string, type: "VERIFY" | "RESET") {
  const rows = await getDb()
    .select()
    .from(schema.otps)
    .where(
      and(
        eq(schema.otps.email, email),
        eq(schema.otps.code, code),
        eq(schema.otps.type, type),
        gt(schema.otps.expiresAt, new Date())
      )
    )
    .limit(1);
  return rows.at(0);
}

export async function deleteOtp(id: number) {
  await getDb()
    .delete(schema.otps)
    .where(eq(schema.otps.id, id));
}

export async function deleteExpiredOtps() {
  await getDb()
    .delete(schema.otps)
    .where(gt(schema.otps.expiresAt, new Date()));
}

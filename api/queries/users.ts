import { eq, sql } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "ADMIN";
    updateSet.role = "ADMIN";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return rows.at(0);
}

export async function findUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "MEMBER" | "ADMIN";
  isVerified?: boolean;
}) {
  const result = await getDb()
    .insert(schema.users)
    .values({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role ?? "MEMBER",
      isVerified: data.isVerified ?? false,
      lastSignInAt: new Date(),
    });
  return result;
}

export async function updateUserVerification(email: string) {
  await getDb()
    .update(schema.users)
    .set({ isVerified: true })
    .where(eq(schema.users.email, email));
}

export async function updateUserPassword(email: string, password: string) {
  await getDb()
    .update(schema.users)
    .set({ password })
    .where(eq(schema.users.email, email));
}

export async function updateUserLastSignIn(id: number) {
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date() })
    .where(eq(schema.users.id, id));
}

export async function listAllUsers() {
  return getDb()
    .select()
    .from(schema.users)
    .orderBy(schema.users.createdAt);
}

export async function getUserStats() {
  const db = getDb();
  const totalUsers = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users);
  const adminCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users)
    .where(eq(schema.users.role, "ADMIN"));
  return {
    totalUsers: totalUsers[0]?.count ?? 0,
    adminCount: adminCount[0]?.count ?? 0,
  };
}

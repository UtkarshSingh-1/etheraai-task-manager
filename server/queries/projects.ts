import { eq, and, inArray, sql } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function createProject(data: { name: string; description?: string; createdBy: number }) {
  const result = await getDb()
    .insert(schema.projects)
    .values({
      name: data.name,
      description: data.description ?? null,
      createdBy: data.createdBy,
    });
  return result;
}

export async function findProjectById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, id))
    .limit(1);
  return rows.at(0);
}

export async function listProjectsForUser(userId: number) {
  const db = getDb();
  const owned = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.createdBy, userId));

  const memberProjectIds = await db
    .select({ projectId: schema.projectMembers.projectId })
    .from(schema.projectMembers)
    .where(eq(schema.projectMembers.userId, userId));

  const ids = memberProjectIds.map((m) => m.projectId);
  if (ids.length === 0) return owned;

  const memberProjects = await db
    .select()
    .from(schema.projects)
    .where(inArray(schema.projects.id, ids));

  const all = [...owned, ...memberProjects];
  const unique = Array.from(new Map(all.map((p) => [p.id, p])).values());
  return unique;
}

export async function listAllProjects() {
  return getDb()
    .select()
    .from(schema.projects)
    .orderBy(schema.projects.createdAt);
}

export async function deleteProject(id: number) {
  await getDb()
    .delete(schema.projects)
    .where(eq(schema.projects.id, id));
}

export async function addProjectMember(projectId: number, userId: number) {
  await getDb()
    .insert(schema.projectMembers)
    .values({ projectId, userId })
    .onDuplicateKeyUpdate({ set: { projectId } });
}

export async function removeProjectMember(projectId: number, userId: number) {
  await getDb()
    .delete(schema.projectMembers)
    .where(
      and(
        eq(schema.projectMembers.projectId, projectId),
        eq(schema.projectMembers.userId, userId)
      )
    );
}

export async function getProjectMembers(projectId: number) {
  return getDb()
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      joinedAt: schema.projectMembers.joinedAt,
    })
    .from(schema.projectMembers)
    .innerJoin(schema.users, eq(schema.projectMembers.userId, schema.users.id))
    .where(eq(schema.projectMembers.projectId, projectId));
}

export async function getProjectStats() {
  const db = getDb();
  const totalProjects = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.projects);
  return {
    totalProjects: totalProjects[0]?.count ?? 0,
  };
}

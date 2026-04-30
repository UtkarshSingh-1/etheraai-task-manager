import { eq, and, sql, inArray, lte, isNotNull } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function createTask(data: {
  title: string;
  description?: string;
  projectId: number;
  assignedTo?: number;
  dueDate?: string;
}) {
  const values: schema.InsertTask = {
    title: data.title,
    description: data.description ?? null,
    projectId: data.projectId,
    assignedTo: data.assignedTo ?? null,
    status: "TODO",
  };
  if (data.dueDate) {
    values.dueDate = new Date(data.dueDate);
  }
  const result = await getDb()
    .insert(schema.tasks)
    .values(values);
  return result;
}

export async function findTaskById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.id, id))
    .limit(1);
  return rows.at(0);
}

export async function listTasksForProject(projectId: number) {
  return getDb()
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.projectId, projectId))
    .orderBy(schema.tasks.createdAt);
}

export async function listTasksForUser(userId: number) {
  return getDb()
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.assignedTo, userId))
    .orderBy(schema.tasks.createdAt);
}

export async function listAllTasks() {
  return getDb()
    .select()
    .from(schema.tasks)
    .orderBy(schema.tasks.createdAt);
}

export async function updateTaskStatus(id: number, status: "TODO" | "IN_PROGRESS" | "DONE") {
  await getDb()
    .update(schema.tasks)
    .set({ status })
    .where(eq(schema.tasks.id, id));
}

export async function assignTask(id: number, userId: number | null) {
  await getDb()
    .update(schema.tasks)
    .set({ assignedTo: userId })
    .where(eq(schema.tasks.id, id));
}

export async function deleteTask(id: number) {
  await getDb()
    .delete(schema.tasks)
    .where(eq(schema.tasks.id, id));
}

export async function getTaskStats() {
  const db = getDb();
  const totalTasks = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.tasks);
  const completedTasks = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.tasks)
    .where(eq(schema.tasks.status, "DONE"));
  const pendingTasks = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.tasks)
    .where(inArray(schema.tasks.status, ["TODO", "IN_PROGRESS"]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.tasks)
    .where(
      and(
        inArray(schema.tasks.status, ["TODO", "IN_PROGRESS"]),
        isNotNull(schema.tasks.dueDate),
        lte(schema.tasks.dueDate, today)
      )
    );

  return {
    totalTasks: totalTasks[0]?.count ?? 0,
    completedTasks: completedTasks[0]?.count ?? 0,
    pendingTasks: pendingTasks[0]?.count ?? 0,
    overdueTasks: overdueTasks[0]?.count ?? 0,
  };
}

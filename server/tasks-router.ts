import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import {
  createTask,
  findTaskById,
  listTasksForProject,
  listTasksForUser,
  listAllTasks,
  updateTaskStatus,
  assignTask,
  deleteTask,
  updateTask,
} from "./queries/tasks";

export const tasksRouter = createRouter({
  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        projectId: z.number(),
        assignedTo: z.number().optional(),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await createTask({
        title: input.title,
        description: input.description,
        projectId: input.projectId,
        assignedTo: input.assignedTo,
        dueDate: input.dueDate,
      });
      return { success: true, taskId: Number(result[0].insertId) };
    }),

  list: authedQuery.query(async ({ ctx }) => {
    if (ctx.user.role === "ADMIN") {
      return listAllTasks();
    }
    return listTasksForUser(ctx.user.id);
  }),

  listByProject: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return listTasksForProject(input.projectId);
    }),

  updateStatus: authedQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const task = await findTaskById(input.id);
      if (!task) {
        return { success: false, message: "Task not found" };
      }
      if (ctx.user.role !== "ADMIN" && task.assignedTo !== ctx.user.id) {
        return { success: false, message: "Not authorized" };
      }
      await updateTaskStatus(input.id, input.status);
      return { success: true };
    }),

  assign: adminQuery
    .input(z.object({ id: z.number(), userId: z.number().nullable() }))
    .mutation(async ({ input }) => {
      await assignTask(input.id, input.userId);
      return { success: true };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        assignedTo: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await updateTask(input.id, {
        title: input.title,
        description: input.description,
        assignedTo: input.assignedTo,
      });
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteTask(input.id);
      return { success: true };
    }),
});

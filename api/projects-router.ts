import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import {
  createProject,
  findProjectById,
  listProjectsForUser,
  listAllProjects,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  getProjectMembers,
} from "./queries/projects";
import { listTasksForProject } from "./queries/tasks";

export const projectsRouter = createRouter({
  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createProject({
        name: input.name,
        description: input.description,
        createdBy: ctx.user.id,
      });
      return { success: true, projectId: Number(result[0].insertId) };
    }),

  list: authedQuery.query(async ({ ctx }) => {
    if (ctx.user.role === "ADMIN") {
      return listAllProjects();
    }
    return listProjectsForUser(ctx.user.id);
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const project = await findProjectById(input.id);
      if (!project) return null;
      const members = await getProjectMembers(input.id);
      const tasks = await listTasksForProject(input.id);
      return { ...project, members, tasks };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteProject(input.id);
      return { success: true };
    }),

  addMember: adminQuery
    .input(z.object({ projectId: z.number(), userId: z.number() }))
    .mutation(async ({ input }) => {
      await addProjectMember(input.projectId, input.userId);
      return { success: true };
    }),

  removeMember: adminQuery
    .input(z.object({ projectId: z.number(), userId: z.number() }))
    .mutation(async ({ input }) => {
      await removeProjectMember(input.projectId, input.userId);
      return { success: true };
    }),

  getMembers: authedQuery
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return getProjectMembers(input.projectId);
    }),
});

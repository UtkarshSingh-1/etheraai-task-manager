import { createRouter, adminQuery } from "./middleware";
import { getTaskStats, getTeamProgress } from "./queries/tasks";
import { getUserStats, listAllUsers, createUser } from "./queries/users";
import { getProjectStats } from "./queries/projects";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const taskStats = await getTaskStats();
    const userStats = await getUserStats();
    const projectStats = await getProjectStats();
    return {
      ...taskStats,
      ...userStats,
      ...projectStats,
    };
  }),

  users: adminQuery.query(async () => {
    return listAllUsers();
  }),
  
  teamProgress: adminQuery.query(async () => {
    return getTeamProgress();
  }),

  createUser: adminQuery
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["MEMBER", "ADMIN"]).default("MEMBER"),
    }))
    .mutation(async ({ input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 12);
      await createUser({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
        isVerified: true, // Admin-created users are verified by default
      });
      return { success: true };
    }),
});

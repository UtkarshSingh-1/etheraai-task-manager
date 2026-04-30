import { createRouter, adminQuery } from "./middleware";
import { getTaskStats } from "./queries/tasks";
import { getUserStats, listAllUsers } from "./queries/users";
import { getProjectStats } from "./queries/projects";

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
});

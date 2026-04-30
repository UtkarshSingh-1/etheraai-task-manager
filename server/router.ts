import { authRouter } from "./auth-router";
import { customAuthRouter } from "./custom-auth-router";
import { projectsRouter } from "./projects-router";
import { tasksRouter } from "./tasks-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  customAuth: customAuthRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

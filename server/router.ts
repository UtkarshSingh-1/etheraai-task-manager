import { authRouter } from "./auth-router.js";
import { customAuthRouter } from "./custom-auth-router.js";
import { projectsRouter } from "./projects-router.js";
import { tasksRouter } from "./tasks-router.js";
import { adminRouter } from "./admin-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  customAuth: customAuthRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

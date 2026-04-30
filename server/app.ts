import { Hono } from "hono";
import { trpcServer } from "@trpc/server/adapters/hono";
import { appRouter } from "./router";
import { createContext } from "./context";
import { customAuth } from "./lib/custom-auth";
import { createGoogleOAuthCallbackHandler } from "./lib/google-auth";

const app = new Hono();

// Custom Auth middleware
app.use("*", customAuth);

// Google OAuth
app.get("/api/oauth/callback", createGoogleOAuthCallbackHandler());

// tRPC
app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

export default app;

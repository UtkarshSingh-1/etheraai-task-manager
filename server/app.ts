import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { createGoogleOAuthCallbackHandler } from "./lib/google-auth.js";

const app = new Hono();

// Google OAuth
app.get("/api/oauth/callback", createGoogleOAuthCallbackHandler());

// tRPC
app.all("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: createContext,
  });
});

export default app;

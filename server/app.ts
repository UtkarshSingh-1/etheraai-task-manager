import { Hono } from "hono";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { createGoogleOAuthCallbackHandler } from "./lib/google-auth";

const app = new Hono();

// Google OAuth
app.get("/api/oauth/callback", createGoogleOAuthCallbackHandler());

// tRPC
app.all("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext({ ...opts, resHeaders: c.res.headers }),
  });
});

export default app;

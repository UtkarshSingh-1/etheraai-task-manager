import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as cookie from "cookie";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { signSessionToken } from "./session";
import { upsertUser } from "../queries/users";

async function exchangeGoogleCode(code: string, redirectUri: string) {
  const body = new URLSearchParams({
    code,
    client_id: env.googleClientId,
    client_secret: env.googleClientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Google token exchange failed: ${text}`);
  }

  return resp.json();
}

async function getGoogleUserInfo(accessToken: string) {
  const resp = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!resp.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return resp.json();
}

export function createGoogleOAuthCallbackHandler() {
  return async (c: Context) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");

    if (error) {
      return c.json({ error }, 400);
    }

    if (!code) {
      return c.json({ error: "code is required" }, 400);
    }

    try {
      const redirectUri = state ? atob(state) : `${new URL(c.req.url).origin}/api/oauth/callback`;
      const tokens = await exchangeGoogleCode(code, redirectUri);
      const userInfo = await getGoogleUserInfo(tokens.access_token);

      // userInfo contains: sub (id), name, email, picture (avatar)
      await upsertUser({
        unionId: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture,
        lastSignInAt: new Date(),
      });

      const token = await signSessionToken({
        unionId: userInfo.sub,
        clientId: env.googleClientId,
      });

      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      return c.redirect("/", 302);
    } catch (err) {
      console.error("[Google OAuth] Callback failed", err);
      return c.json({ error: "Authentication failed" }, 500);
    }
  };
}

import * as jose from "jose";
import * as cookie from "cookie";
import { env } from "./lib/env";
import { findUserById } from "./queries/users";
import { Session } from "@contracts/constants";

const JWT_ALG = "HS256";

export async function signCustomSession(userId: number): Promise<string> {
  const secret = new TextEncoder().encode(env.jwtSecret);
  return new jose.SignJWT({ userId, type: "custom" })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyCustomSession(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) return undefined;

  try {
    const secret = new TextEncoder().encode(env.jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      clockTolerance: 60,
    });

    if (payload.type !== "custom" || !payload.userId) {
      return undefined;
    }

    const user = await findUserById(Number(payload.userId));
    if (!user) return undefined;

    return user;
  } catch {
    return undefined;
  }
}

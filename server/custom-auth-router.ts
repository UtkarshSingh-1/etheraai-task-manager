import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import {
  findUserByEmail,
  createUser,
  updateUserVerification,
  updateUserPassword,
  updateUserLastSignIn,
} from "./queries/users";
import { createOtp, findValidOtp, deleteOtp } from "./queries/otp";
import { sendEmail, generateOtp, getOtpEmailTemplate } from "./lib/email";
import { signCustomSession } from "./custom-auth";
import { getSessionCookieOptions } from "./lib/cookies";
import { Session } from "@contracts/constants";
import * as cookie from "cookie";

export const customAuthRouter = createRouter({
  requestSignupOtp: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }: { input: { email: string } }) => {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered. Please sign in instead.",
        });
      }

      const otpCode = generateOtp();
      await createOtp({ email: input.email, code: otpCode, type: "VERIFY" });

      try {
        await sendEmail(
          input.email,
          "Verify Your Email",
          getOtpEmailTemplate(otpCode, "VERIFY")
        );
      } catch (e) {
        console.error("[email] Failed to send verification email:", e);
      }

      return { success: true, message: "Verification code sent to your email." };
    }),

  register: publicQuery
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        otp: z.string().length(6, "OTP must be 6 digits"),
        role: z.enum(["MEMBER", "ADMIN"]),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      // 1. Verify OTP
      const otp = await findValidOtp(input.email, input.otp, "VERIFY");
      if (!otp) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification code",
        });
      }

      // 2. Check if email was taken while waiting
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      // 3. Create user (mark as verified immediately)
      const hashedPassword = await bcrypt.hash(input.password, 12);
      await createUser({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
        isVerified: true,
      });

      // 4. Cleanup OTP
      await deleteOtp(otp.id);

      return { success: true, message: "Account created successfully!" };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
      const user = await findUserByEmail(input.email);
      if (!user || !user.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      if (!user.isVerified) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Please verify your email before logging in",
        });
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      await updateUserLastSignIn(user.id);

      const token = await signCustomSession(user.id);
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        })
      );

      return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }),

  verifyOtp: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6, "OTP must be 6 digits"),
        type: z.enum(["VERIFY", "RESET"]),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      const otp = await findValidOtp(input.email, input.code, input.type);
      if (!otp) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired OTP",
        });
      }

      await deleteOtp(otp.id);

      if (input.type === "VERIFY") {
        await updateUserVerification(input.email);
        return { success: true, message: "Email verified successfully" };
      }

      return { success: true, message: "OTP verified" };
    }),

  resendOtp: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        type: z.enum(["VERIFY", "RESET"]),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      const otpCode = generateOtp();
      await createOtp({ email: input.email, code: otpCode, type: input.type });

      const subject = input.type === "VERIFY" ? "Verify Your Email" : "Reset Your Password";
      try {
        await sendEmail(
          input.email,
          subject,
          getOtpEmailTemplate(otpCode, input.type)
        );
      } catch (e) {
        console.error("[email] Failed to resend OTP:", e);
      }

      return { success: true, message: "OTP sent successfully" };
    }),

  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }: { input: any }) => {
      const user = await findUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No account found with this email",
        });
      }

      const otpCode = generateOtp();
      await createOtp({ email: input.email, code: otpCode, type: "RESET" });

      try {
        await sendEmail(
          input.email,
          "Reset Your Password",
          getOtpEmailTemplate(otpCode, "RESET")
        );
      } catch (e) {
        console.error("[email] Failed to send reset email:", e);
      }

      return { success: true, message: "Password reset OTP sent" };
    }),

  resetPassword: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().length(6),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      const otp = await findValidOtp(input.email, input.code, "RESET");
      if (!otp) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired OTP",
        });
      }

      await deleteOtp(otp.id);

      const hashed = await bcrypt.hash(input.newPassword, 12);
      await updateUserPassword(input.email, hashed);

      return { success: true, message: "Password reset successfully" };
    }),

  me: publicQuery.query(async ({ ctx }: { ctx: any }) => {
    if (!ctx.user) return null;
    return {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      role: ctx.user.role,
      avatar: ctx.user.avatar,
      isVerified: ctx.user.isVerified,
    };
  }),
});

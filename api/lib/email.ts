import nodemailer from "nodemailer";
import { env } from "./env";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
  family: 4,
  localAddress: "0.0.0.0", // Force local IPv4 to avoid ENETUNREACH on IPv6
  connectionTimeout: 15000,
  greetingTimeout: 15000,
} as any);

export async function sendEmail(to: string, subject: string, html: string) {
  if (!env.smtpUser || !env.smtpPass) {
    console.warn("[email] SMTP credentials not configured");
    return;
  }

  const start = Date.now();
  console.log(`[email] Sending to ${to} (Config: ${env.smtpUser ? 'OK' : 'MISSING'})...`);

  // We don't await this inside the mutation anymore for instant UI
  transporter.sendMail({
    from: `"Ethera Team" <${env.smtpUser}>`,
    to,
    subject,
    html,
  }).then(() => {
    console.log(`[email] Successfully sent to ${to} in ${Date.now() - start}ms`);
  }).catch((err) => {
    console.error(`[email] Failed to send to ${to} after ${Date.now() - start}ms:`, err);
  });
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpEmailTemplate(code: string, type: "VERIFY" | "RESET"): string {
  const title = type === "VERIFY" ? "Email Verification" : "Password Reset";
  const action = type === "VERIFY" ? "verify your email" : "reset your password";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #f9fafb; border-radius: 12px;">
      <h2 style="color: #111827; margin-bottom: 16px;">${title}</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
        Use the following OTP code to ${action}. This code will expire in 5 minutes.
      </p>
      <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
      </div>
      <p style="color: #9ca3af; font-size: 14px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;
}

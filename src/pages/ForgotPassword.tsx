import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const forgotMutation = trpc.customAuth.forgotPassword.useMutation({
    onSuccess: () => {
      toast.success("OTP sent to your email");
      setStep("otp");
    },
    onError: (err) => toast.error(err.message),
  });

  const resetMutation = trpc.customAuth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successfully! Please log in.");
      window.location.href = "/login";
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    forgotMutation.mutate({ email });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`f-otp-${index + 1}`)?.focus();
    }
    if (newOtp.every((d) => d)) {
      setStep("reset");
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    resetMutation.mutate({
      email,
      code: otp.join(""),
      newPassword,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">
                {step === "email" && "Forgot Password"}
                {step === "otp" && "Enter OTP"}
                {step === "reset" && "New Password"}
              </h1>
              <p className="text-sm text-neutral-500">
                {step === "email" && "We'll send you a reset code"}
                {step === "otp" && "Enter the 6-digit code"}
                {step === "reset" && "Create a new password"}
              </p>
            </div>
          </div>

          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-neutral-900 hover:bg-neutral-800"
                disabled={forgotMutation.isPending}
              >
                {forgotMutation.isPending ? "Sending..." : "Send Reset Code"}
              </Button>
              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 mt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to login
              </Link>
            </form>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">Code sent to <span className="font-medium">{email}</span></p>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`f-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-11 h-12 text-center text-lg font-semibold rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  forgotMutation.mutate({ email });
                  setOtp(["", "", "", "", "", ""]);
                }}
                className="text-sm text-neutral-600 hover:text-neutral-900 w-full text-center"
              >
                Resend code
              </button>
            </div>
          )}

          {step === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-neutral-700">New Password</Label>
                <Input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-neutral-700">Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-neutral-900 hover:bg-neutral-800"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

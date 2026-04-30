import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState((location.state as { email?: string })?.email ?? "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);

  const verifyMutation = trpc.customAuth.verifyOtp.useMutation({
    onSuccess: () => {
      toast.success("Email verified! You can now log in.");
      navigate("/login");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const resendMutation = trpc.customAuth.resendOtp.useMutation({
    onSuccess: () => {
      toast.success("OTP resent");
      setTimer(60);
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }

    if (newOtp.every((d) => d) && email) {
      verifyMutation.mutate({
        email,
        code: newOtp.join(""),
        type: "VERIFY",
      });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleResend = () => {
    if (!email || timer > 0) return;
    resendMutation.mutate({ email, type: "VERIFY" });
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
              <h1 className="text-lg font-semibold text-neutral-900">Verify Email</h1>
              <p className="text-sm text-neutral-500">Enter the 6-digit code sent to your email</p>
            </div>
          </div>

          {!email && (
            <div className="mb-4">
              <label className="text-sm font-medium text-neutral-700 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="you@example.com"
              />
            </div>
          )}

          {email && (
            <p className="text-sm text-neutral-600 mb-4">
              Code sent to <span className="font-medium">{email}</span>
            </p>
          )}

          <div className="flex gap-2 justify-center mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-semibold rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              />
            ))}
          </div>

          <Button
            onClick={() => {
              if (email && otp.every((d) => d)) {
                verifyMutation.mutate({ email, code: otp.join(""), type: "VERIFY" });
              }
            }}
            disabled={!email || !otp.every((d) => d) || verifyMutation.isPending}
            className="w-full bg-neutral-900 hover:bg-neutral-800 mb-4"
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={timer > 0 || resendMutation.isPending}
              className="text-sm text-neutral-600 hover:text-neutral-900 disabled:text-neutral-300 transition-colors"
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

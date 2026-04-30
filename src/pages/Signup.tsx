import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Eye, EyeOff, Chrome, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

function getOAuthUrl() {
  const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
  
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", btoa(redirectUri));

  return url.toString();
}

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"info" | "otp">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const requestOtpMutation = trpc.customAuth.requestSignupOtp.useMutation({
    onSuccess: () => {
      toast.success("Verification code sent to your email!");
      setStep("otp");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const registerMutation = trpc.customAuth.register.useMutation({
    onSuccess: () => {
      toast.success("Account created successfully!");
      navigate("/login");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    requestOtpMutation.mutate({ email });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    registerMutation.mutate({ name, email, password, otp });
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
                {step === "info" ? "Create account" : "Verify email"}
              </h1>
              <p className="text-sm text-neutral-500">
                {step === "info" ? "Start managing your tasks" : `Code sent to ${email}`}
              </p>
            </div>
          </div>

          {step === "info" ? (
            <>
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-neutral-700">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

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

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-neutral-900 hover:bg-neutral-800"
                  disabled={requestOtpMutation.isPending}
                >
                  {requestOtpMutation.isPending ? "Sending code..." : "Continue"}
                </Button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-neutral-400">or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  window.location.href = getOAuthUrl();
                }}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
            </>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="otp" className="text-sm font-medium text-neutral-700">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="mt-1.5 text-center text-2xl tracking-[0.5em] font-mono"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-neutral-900 hover:bg-neutral-800"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Verifying..." : "Verify & Create Account"}
              </Button>

              <button
                type="button"
                onClick={() => setStep("info")}
                className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to information
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link to="/login" className="text-neutral-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

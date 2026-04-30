import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Eye, EyeOff, Chrome } from "lucide-react";
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

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = trpc.customAuth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Login successful");
      if (data.user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    },
    onError: (err) => {
      if (err.message.includes("verify your email")) {
        toast.error("Please verify your email first");
        navigate("/verify", { state: { email } });
      } else {
        toast.error(err.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#5B0E14]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#5B0E14]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/5 border border-neutral-100 p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#5B0E14] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#5B0E14]/20">
              <Briefcase className="w-7 h-7 text-[#F1E194]" />
            </div>
            <h1 className="text-2xl font-bold text-[#5B0E14] tracking-tight">Welcome back to Ethera</h1>
            <p className="text-sm text-neutral-500 mt-1.5 font-medium">Elevate your team's productivity</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 px-4 rounded-xl border-neutral-200 focus:ring-[#5B0E14] focus:border-[#5B0E14] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 px-4 rounded-xl border-neutral-200 focus:ring-[#5B0E14] focus:border-[#5B0E14] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#5B0E14] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-xs font-bold text-[#5B0E14] hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#5B0E14] hover:bg-[#4A0B10] text-[#F1E194] font-bold rounded-xl shadow-lg shadow-[#5B0E14]/10 transition-all active:scale-[0.98]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "AUTHENTICATING..." : "SIGN IN"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-white px-4 text-neutral-400">or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-neutral-200 hover:bg-neutral-50 font-bold text-neutral-600 transition-all active:scale-[0.98]"
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
          >
            <Chrome className="w-4 h-4 mr-2 text-[#4285F4]" />
            GOOGLE ACCOUNT
          </Button>

          <p className="mt-8 text-center text-sm text-neutral-500 font-medium">
            New to Ethera?{" "}
            <Link to="/signup" className="text-[#5B0E14] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

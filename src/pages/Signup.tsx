import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Eye, EyeOff, Chrome, Shield } from "lucide-react";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");

  const registerMutation = trpc.customAuth.directRegister.useMutation({
    onSuccess: () => {
      toast.success("Account created! Please sign in.");
      navigate("/login");
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    registerMutation.mutate({ name, email, password, role });
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
            <h1 className="text-2xl font-bold text-[#5B0E14] tracking-tight">Join Ethera AI</h1>
            <p className="text-sm text-neutral-500 mt-1.5 font-medium">Experience the future of task management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 px-4 rounded-xl border-neutral-200 focus:ring-[#5B0E14] focus:border-[#5B0E14] transition-all"
              />
            </div>

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
                  placeholder="Min. 6 characters"
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

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Select Role</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("MEMBER")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    role === "MEMBER"
                      ? "border-[#5B0E14] bg-[#5B0E14]/5 text-[#5B0E14]"
                      : "border-neutral-100 hover:border-neutral-200 text-neutral-400"
                  }`}
                >
                  <div className={`p-2 rounded-lg mb-2 ${role === "MEMBER" ? "bg-[#5B0E14] text-[#F1E194]" : "bg-neutral-100"}`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Member</span>
                  <p className="text-[10px] text-center mt-1 opacity-60">Update assigned tasks</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    role === "ADMIN"
                      ? "border-[#5B0E14] bg-[#5B0E14]/5 text-[#5B0E14]"
                      : "border-neutral-100 hover:border-neutral-200 text-neutral-400"
                  }`}
                >
                  <div className={`p-2 rounded-lg mb-2 ${role === "ADMIN" ? "bg-[#5B0E14] text-[#F1E194]" : "bg-neutral-100"}`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Admin</span>
                  <p className="text-[10px] text-center mt-1 opacity-60">Full project control</p>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#5B0E14] hover:bg-[#4A0B10] text-[#F1E194] font-bold rounded-xl shadow-lg shadow-[#5B0E14]/10 transition-all active:scale-[0.98]"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-white px-4 text-neutral-400">or join with</span>
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
            Already have an account?{" "}
            <Link to="/login" className="text-[#5B0E14] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

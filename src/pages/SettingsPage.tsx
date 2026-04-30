import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, LogOut, Mail } from "lucide-react";

export default function SettingsPage() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#5B0E14]">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your professional profile and account security</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="rounded-3xl border-neutral-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-[#5B0E14]/5">
            <CardTitle className="text-xs font-black text-[#5B0E14] uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-[#5B0E14]/10 shadow-md">
                <AvatarFallback className="bg-[#5B0E14] text-[#F1E194] text-xl font-black">
                  {user?.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <p className="text-xl font-black text-[#5B0E14]">{user?.name}</p>
                <div className="flex items-center gap-2 text-neutral-500 mt-1 justify-center sm:justify-start font-medium">
                  <Mail className="w-4 h-4 opacity-50" />
                  <p className="text-sm">{user?.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-neutral-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-[#5B0E14]/5">
            <CardTitle className="text-xs font-black text-[#5B0E14] uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permissions & Authority
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`shrink-0 text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-tighter shadow-sm ${isAdmin ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-neutral-100 text-neutral-600 border border-neutral-200"}`}>
                {user?.role ?? "MEMBER"}
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                {isAdmin
                  ? "As an Administrative user, you have full authority to oversee team performance, manage projects, and moderate user accounts."
                  : "As a Team Member, you have access to your assigned projects and the ability to update the status of your assigned tasks."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-neutral-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-xs text-neutral-400 mb-4 font-medium italic">Sign out of your session on this device.</p>
            <Button
              variant="outline"
              className="w-full sm:w-auto h-11 px-6 rounded-xl text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold transition-all active:scale-[0.98]"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              SIGN OUT
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

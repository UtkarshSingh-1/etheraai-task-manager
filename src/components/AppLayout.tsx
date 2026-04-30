import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { Navigate } from "react-router";
import { useState } from "react";
import { Menu, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FDFBF7]">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#FDFBF7] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              <AppSidebar user={user} onAction={() => setIsMobileMenuOpen(false)} isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AppSidebar user={user} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-[#5B0E14] border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F1E194] flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#5B0E14]" />
            </div>
            <span className="font-bold text-sm text-[#F1E194] tracking-tight">ETHERA AI</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-white/10 text-[#F1E194]"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-auto relative">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

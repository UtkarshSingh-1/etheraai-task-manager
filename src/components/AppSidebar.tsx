import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Briefcase,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppSidebarProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  } | null;
  onAction?: () => void;
  isMobile?: boolean;
}

export function AppSidebar({ user, onAction, isMobile }: AppSidebarProps) {
  const { logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: isAdmin ? "/admin/dashboard" : "/dashboard" },
    { label: "Projects", icon: FolderKanban, href: "/projects" },
    { label: "Tasks", icon: ClipboardList, href: "/tasks" },
    ...(isAdmin ? [{ label: "Users", icon: Users, href: "/admin/users" }] : []),
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const actualCollapsed = isMobile ? false : collapsed;

  return (
    <motion.aside
      animate={{ width: actualCollapsed ? 72 : (isMobile ? "100%" : 260) }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col border-r border-neutral-200 bg-[#5B0E14] h-screen shrink-0 text-[#F1E194]/80 shadow-2xl lg:shadow-none"
    >
      <div className="flex items-center gap-3 h-16 px-4 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#F1E194] flex items-center justify-center shrink-0">
          <Briefcase className="w-4 h-4 text-[#5B0E14]" />
        </div>
        <AnimatePresence>
          {!actualCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-sm text-[#F1E194] whitespace-nowrap tracking-wide"
            >
              ETHERA AI
            </motion.span>
          )}
        </AnimatePresence>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded-md hover:bg-white/10 transition-colors text-[#F1E194]"
          >
            {actualCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onAction}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                isActive
                  ? "bg-[#F1E194] text-[#5B0E14] shadow-lg shadow-black/20"
                  : "text-[#F1E194]/60 hover:bg-white/5 hover:text-[#F1E194]"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {!actualCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 shrink-0 bg-[#5B0E14]">
        <div className="flex items-center gap-3 px-3 py-3 bg-white/5 rounded-2xl">
          <Avatar className="w-9 h-9 shrink-0 border border-[#F1E194]/20 shadow-sm">
            <AvatarFallback className="bg-[#F1E194] text-[#5B0E14] text-xs font-black">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!actualCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-bold text-[#F1E194] truncate">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[10px] text-[#F1E194]/40 truncate font-medium uppercase tracking-wider">{user?.role}</p>
                  {isAdmin && <Shield className="w-3 h-3 text-[#F1E194] shrink-0 opacity-50" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!actualCollapsed && (
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-white/10 text-[#F1E194]/40 hover:text-[#F1E194] transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

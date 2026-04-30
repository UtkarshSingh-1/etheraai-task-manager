import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { Navigate } from "react-router";

export function AppLayout() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <AppSidebar user={user} />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

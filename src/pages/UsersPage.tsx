import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Users, Calendar } from "lucide-react";

export default function UsersPage() {
  const { data: users, isLoading } = trpc.admin.users.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#5B0E14]">Team Members</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage and oversee all registered users in the platform</p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#5B0E14]/5 text-[10px] font-black text-[#5B0E14] uppercase tracking-widest">
          <div className="col-span-4">Member</div>
          <div className="col-span-3">Email Address</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-right">Joined</div>
        </div>

        <div className="divide-y divide-neutral-100">
          {(users ?? []).map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="md:grid md:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-neutral-50 transition-colors"
            >
              {/* Mobile Layout: Stacked */}
              <div className="md:col-span-4 flex items-center gap-4 mb-4 md:mb-0">
                <Avatar className="w-10 h-10 border-2 border-[#5B0E14]/10 shadow-sm">
                  <AvatarFallback className="bg-[#5B0E14] text-[#F1E194] text-xs font-black">
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-[#5B0E14]">{user.name}</p>
                  <p className="md:hidden text-[10px] text-neutral-400 font-medium">{user.email}</p>
                </div>
              </div>

              {/* Desktop Only Email */}
              <div className="hidden md:col-span-3 text-sm text-neutral-600 font-medium truncate">
                {user.email}
              </div>

              {/* Role */}
              <div className="md:col-span-2 mb-3 md:mb-0">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter ${user.role === "ADMIN" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-neutral-100 text-neutral-600 border border-neutral-200"}`}>
                  {user.role === "ADMIN" && <Shield className="w-3 h-3" />}
                  {user.role}
                </span>
              </div>

              {/* Status */}
              <div className="md:col-span-2 mb-4 md:mb-0 md:text-center">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter ${user.isVerified ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-500 border border-red-200"}`}>
                  {user.isVerified ? "Verified" : "Pending"}
                </span>
              </div>

              {/* Joined */}
              <div className="md:col-span-1 text-[10px] font-bold text-neutral-400 md:text-right uppercase tracking-widest">
                <div className="flex items-center gap-1 md:justify-end">
                   <Calendar className="w-3 h-3 md:hidden" />
                   {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {(users ?? []).length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-neutral-100 mx-auto mb-4" />
            <h3 className="text-[#5B0E14] font-bold">No Team Members Found</h3>
            <p className="text-sm text-neutral-400">Members will appear here once they sign up.</p>
          </div>
        )}
      </div>
    </div>
  );
}

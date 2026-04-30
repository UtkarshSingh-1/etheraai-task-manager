import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Users } from "lucide-react";

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
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
        <p className="text-sm text-neutral-500 mt-1">All registered users</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-neutral-50 text-xs font-medium text-neutral-500 uppercase">
          <div className="col-span-4">User</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Joined</div>
        </div>

        <div className="divide-y divide-neutral-100">
          {(users ?? []).map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-neutral-50 transition-colors"
            >
              <div className="col-span-4 flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-neutral-200 text-xs font-medium">
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-neutral-900">{user.name}</span>
              </div>
              <div className="col-span-3 text-sm text-neutral-600">{user.email}</div>
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${user.role === "ADMIN" ? "bg-amber-50 text-amber-700" : "bg-neutral-100 text-neutral-600"}`}>
                  {user.role === "ADMIN" && <Shield className="w-3 h-3" />}
                  {user.role}
                </span>
              </div>
              <div className="col-span-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.isVerified ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-500"}`}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
              <div className="col-span-1 text-xs text-neutral-400">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>

        {(users ?? []).length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}

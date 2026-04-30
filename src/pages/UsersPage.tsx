import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Users, Calendar, UserPlus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function UsersPage() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.users.useQuery();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");

  const createMutation = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      toast.success("User created successfully");
      utils.admin.users.invalidate();
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("MEMBER");
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#5B0E14]">Team Members</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage and oversee all registered users in the platform</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#5B0E14] hover:bg-[#4A0B10] text-[#F1E194] shadow-lg shadow-[#5B0E14]/20 px-6">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#5B0E14] font-black uppercase tracking-tight">Add New Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!name || !email || !password) return toast.error("Please fill all fields");
              createMutation.mutate({ name, email, password, role });
            }} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#5B0E14] uppercase tracking-widest">Full Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="bg-neutral-50 border-neutral-200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#5B0E14] uppercase tracking-widest">Email Address</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@ethera.ai" className="bg-neutral-50 border-neutral-200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#5B0E14] uppercase tracking-widest">Initial Password</label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-neutral-50 border-neutral-200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#5B0E14] uppercase tracking-widest">System Role</label>
                <Select value={role} onValueChange={(val: any) => setRole(val)}>
                  <SelectTrigger className="bg-neutral-50 border-neutral-200">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-[#5B0E14] text-[#F1E194] mt-4 py-6 text-sm font-black uppercase tracking-widest" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Account"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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

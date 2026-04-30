import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Spinner } from "@/components/ui/spinner";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  FolderKanban,
} from "lucide-react";
import { Link } from "react-router";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();
  const { data: teamProgress } = trpc.admin.teamProgress.useQuery();
  const { data: recentProjects } = trpc.projects.list.useQuery();
  const { data: recentTasks } = trpc.tasks.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Tasks", value: stats?.totalTasks ?? 0, icon: ClipboardList, color: "bg-[#5B0E14] text-[#F1E194]" },
    { label: "Completed", value: stats?.completedTasks ?? 0, icon: CheckCircle2, color: "bg-[#5B0E14] text-[#F1E194]" },
    { label: "Pending", value: stats?.pendingTasks ?? 0, icon: Clock, color: "bg-[#5B0E14] text-[#F1E194]" },
    { label: "Overdue", value: stats?.overdueTasks ?? 0, icon: AlertTriangle, color: "bg-red-600 text-white" },
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-[#5B0E14] text-[#F1E194]" },
    { label: "Projects", value: stats?.totalProjects ?? 0, icon: FolderKanban, color: "bg-[#5B0E14] text-[#F1E194]" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#5B0E14]">Admin Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Real-time team performance & project insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-bold text-[#5B0E14] mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-[#5B0E14] uppercase tracking-wider">Team Performance</h2>
            <Link to="/admin/users" className="text-xs text-[#5B0E14] font-semibold hover:underline">
              Manage Team
            </Link>
          </div>
          <div className="space-y-6">
            {(teamProgress ?? []).map((member) => {
              const percentage = member.totalTasks > 0 ? Math.round((member.completedTasks / member.totalTasks) * 100) : 0;
              return (
                <div key={member.userId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">{member.userName}</span>
                    <span className="text-xs font-bold text-[#5B0E14]">{percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-[#5B0E14]"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    {member.completedTasks} / {member.totalTasks} Tasks Completed
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm"
          >
            <h2 className="text-sm font-bold text-[#5B0E14] uppercase tracking-wider mb-4">Recent Projects</h2>
            <div className="space-y-4">
              {(recentProjects ?? []).slice(0, 3).map((project) => (
                <div key={project.id} className="group cursor-pointer">
                  <p className="text-sm font-semibold text-neutral-900 group-hover:text-[#5B0E14] transition-colors">
                    {project.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#5B0E14] rounded-xl p-6 shadow-lg shadow-black/10"
          >
            <h2 className="text-sm font-bold text-[#F1E194] uppercase tracking-wider mb-4">Urgent Tasks</h2>
            <div className="space-y-4">
              {(recentTasks ?? []).filter(t => t.status !== 'DONE').slice(0, 3).map((task) => (
                <div key={task.id} className="border-l-2 border-[#F1E194] pl-3">
                  <p className="text-sm font-medium text-white">{task.title}</p>
                  <StatusBadge status={task.status} dark />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, dark }: { status: string; dark?: boolean }) {
  const styles: Record<string, string> = {
    TODO: dark ? "bg-white/10 text-white/60" : "bg-neutral-100 text-neutral-600",
    IN_PROGRESS: dark ? "bg-[#F1E194]/20 text-[#F1E194]" : "bg-blue-50 text-blue-600",
    DONE: dark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${styles[status] ?? ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

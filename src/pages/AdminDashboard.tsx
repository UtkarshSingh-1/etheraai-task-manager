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
    { label: "Total Tasks", value: stats?.totalTasks ?? 0, icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
    { label: "Completed", value: stats?.completedTasks ?? 0, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Pending", value: stats?.pendingTasks ?? 0, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Overdue", value: stats?.overdueTasks ?? 0, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-violet-50 text-violet-600" },
    { label: "Projects", value: stats?.totalProjects ?? 0, icon: FolderKanban, color: "bg-sky-50 text-sky-600" },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Overview of your team's activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-white rounded-xl border border-neutral-200 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500">{card.label}</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-neutral-200 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900">Recent Projects</h2>
            <Link to="/projects" className="text-xs text-neutral-600 hover:text-neutral-900 underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {(recentProjects ?? []).slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between py-2.5 border-b border-neutral-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{project.name}</p>
                  <p className="text-xs text-neutral-500">
                    {project.description?.slice(0, 60) ?? "No description"}
                  </p>
                </div>
                <span className="text-xs text-neutral-400">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {(recentProjects ?? []).length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-4">No projects yet</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-neutral-200 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs text-neutral-600 hover:text-neutral-900 underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {(recentTasks ?? []).slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2.5 border-b border-neutral-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{task.title}</p>
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
            {(recentTasks ?? []).length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-4">No tasks yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    TODO: "bg-neutral-100 text-neutral-600",
    IN_PROGRESS: "bg-blue-50 text-blue-600",
    DONE: "bg-emerald-50 text-emerald-600",
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${styles[status] ?? ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

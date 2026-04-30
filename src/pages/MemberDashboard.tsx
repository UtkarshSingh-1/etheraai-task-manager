import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Spinner } from "@/components/ui/spinner";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
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

export default function MemberDashboard() {
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((t) => t.status === "DONE").length ?? 0;
  const pendingTasks = tasks?.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS").length ?? 0;
  const overdueTasks = tasks?.filter((t) => {
    if (t.status === "DONE") return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  }).length ?? 0;

  const statCards = [
    { label: "Total Tasks", value: totalTasks, icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
    { label: "Completed", value: completedTasks, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Pending", value: pendingTasks, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { label: "Overdue", value: overdueTasks, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">My Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Your assigned tasks at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-neutral-200 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-900">My Tasks</h2>
          <Link to="/tasks" className="text-xs text-neutral-600 hover:text-neutral-900 underline">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {(tasks ?? []).length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-8">No tasks assigned yet</p>
          )}
          {(tasks ?? []).slice(0, 8).map((task) => (
            <div key={task.id} className="flex items-center justify-between py-2.5 border-b border-neutral-50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{task.title}</p>
                <p className="text-xs text-neutral-500 truncate">{task.description ?? "No description"}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <StatusBadge status={task.status} />
                {task.dueDate && (
                  <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "text-red-500" : "text-neutral-400"}`}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
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

import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Spinner } from "@/components/ui/spinner";
import {
  ClipboardList,
  CheckCircle2,
  FolderKanban,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.2 },
  }),
};

export default function MemberDashboard() {
  const { user } = useAuth();
  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.list.useQuery();
  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();

  if (tasksLoading || projectsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((t) => t.status === "DONE").length ?? 0;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statCards = [
    { label: "Total Tasks", value: totalTasks, icon: ClipboardList, color: "bg-[#5B0E14] text-[#F1E194]" },
    { label: "Completed", value: completedTasks, icon: CheckCircle2, color: "bg-[#5B0E14] text-[#F1E194]" },
    { label: "My Projects", value: projects?.length ?? 0, icon: FolderKanban, color: "bg-[#5B0E14] text-[#F1E194]" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#5B0E14]">Welcome back, {user?.name}</h1>
        <p className="text-sm text-neutral-500 mt-1">Focus on your productivity and project goals today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{card.label}</p>
                <p className="text-3xl font-bold text-[#5B0E14] mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#5B0E14] rounded-3xl p-8 text-[#F1E194] shadow-xl shadow-black/10 relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Personal Achievement</h2>
              <p className="text-5xl font-bold mb-4">{percentage}%</p>
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className="h-full bg-[#F1E194]"
                />
              </div>
              <p className="text-sm font-medium opacity-80 leading-relaxed max-w-md">
                You've completed {completedTasks} out of {totalTasks} tasks. You're doing great, keep focusing on those goals!
              </p>
            </div>
            <CheckCircle2 className="absolute -right-12 -bottom-12 w-64 h-64 opacity-5" />
          </motion.div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-[#5B0E14] uppercase tracking-wider">Active Tasks</h2>
              <Link to="/tasks" className="text-xs font-bold text-[#5B0E14] hover:underline flex items-center gap-1">
                ALL TASKS <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {(tasks ?? []).filter(t => t.status !== 'DONE').slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-50 hover:border-[#5B0E14]/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-bold text-neutral-900 group-hover:text-[#5B0E14] transition-colors">{task.title}</p>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">
                        {projects?.find(p => p.id === task.projectId)?.name ?? 'Project'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
              {(tasks ?? []).filter(t => t.status !== 'DONE').length === 0 && (
                <div className="text-center py-10">
                  <p className="text-sm text-neutral-400 italic">No pending tasks. Great job!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#5B0E14] uppercase tracking-wider mb-4">My Projects</h2>
            <div className="space-y-3">
              {(projects ?? []).slice(0, 4).map((project) => (
                <Link 
                  key={project.id} 
                  to={`/projects/${project.id}`}
                  className="block p-4 rounded-xl bg-neutral-50 hover:bg-[#5B0E14] hover:text-[#F1E194] transition-all group border border-transparent hover:border-[#5B0E14]"
                >
                  <p className="text-sm font-bold truncate">{project.name}</p>
                  <p className="text-[10px] opacity-60 mt-1 uppercase font-bold tracking-tighter">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
              {(projects ?? []).length === 0 && (
                <p className="text-xs text-neutral-400 text-center py-6 italic">No projects assigned</p>
              )}
            </div>
          </div>
        </div>
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
    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${styles[status] ?? ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

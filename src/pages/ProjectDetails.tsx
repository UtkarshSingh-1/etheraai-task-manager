import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Users, 
  CheckCircle2, 
  Clock, 
  Circle,
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const { isAdmin } = useAuth();
  const utils = trpc.useUtils();

  const { data: project, isLoading: projectLoading } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.listByProject.useQuery({ projectId });
  const { data: stats } = trpc.projects.stats.useQuery({ projectId });
  const { data: members } = trpc.projects.getMembers.useQuery({ projectId });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task created");
      utils.tasks.listByProject.invalidate({ projectId });
      utils.projects.stats.invalidate({ projectId });
      setTitle("");
      setDescription("");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Task deleted");
      utils.tasks.listByProject.invalidate({ projectId });
      utils.projects.stats.invalidate({ projectId });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      utils.tasks.listByProject.invalidate({ projectId });
      utils.projects.stats.invalidate({ projectId });
    },
  });

  if (projectLoading || tasksLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  const percentage = stats?.total && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <Link to="/projects" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-[#5B0E14] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#5B0E14]">{project.name}</h1>
            <p className="text-neutral-500 mt-2 text-lg leading-relaxed">{project.description ?? "No description provided."}</p>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#5B0E14] uppercase tracking-wider">Project Progress</h2>
              <span className="text-lg font-bold text-[#5B0E14]">{percentage}%</span>
            </div>
            <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className="h-full bg-[#5B0E14]"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5B0E14]">{stats?.completed ?? 0}</p>
                <p className="text-[10px] text-neutral-400 uppercase font-bold">Done</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5B0E14]">{stats?.inProgress ?? 0}</p>
                <p className="text-[10px] text-neutral-400 uppercase font-bold">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#5B0E14]">{stats?.todo ?? 0}</p>
                <p className="text-[10px] text-neutral-400 uppercase font-bold">To Do</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#5B0E14]">Tasks</h2>
            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#5B0E14] hover:bg-[#4A0B10] text-[#F1E194]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Task to {project.name}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!title.trim()) return;
                    createMutation.mutate({ title, description, projectId });
                  }} className="space-y-4 mt-2">
                    <Input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
                    <Textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
                    <Button type="submit" className="w-full bg-[#5B0E14] text-[#F1E194]" disabled={createMutation.isPending}>
                      Create Task
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="space-y-3">
            {(tasks ?? []).map((task) => (
              <motion.div
                key={task.id}
                layout
                className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-4 hover:border-[#5B0E14]/30 transition-colors"
              >
                <button
                  onClick={() => {
                    const next = task.status === "TODO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "DONE" : "TODO";
                    updateStatusMutation.mutate({ id: task.id, status: next });
                  }}
                  className="shrink-0"
                >
                  {task.status === "DONE" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : task.status === "IN_PROGRESS" ? (
                    <Clock className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-300" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${task.status === "DONE" ? "line-through text-neutral-400" : "text-neutral-900"}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{task.description ?? "No description"}</p>
                </div>
                <StatusBadge status={task.status} />
                {isAdmin && (
                  <button 
                    onClick={() => {
                      if(confirm("Delete task?")) deleteMutation.mutate({ id: task.id });
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-[#5B0E14] rounded-2xl p-6 text-[#F1E194] shadow-lg shadow-black/10">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-wider text-sm">Project Team</h3>
            </div>
            <div className="space-y-4">
              {(members ?? []).map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F1E194] text-[#5B0E14] flex items-center justify-center text-xs font-bold shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{member.name}</p>
                    <p className="text-[10px] text-[#F1E194]/60 truncate uppercase">{member.role}</p>
                  </div>
                </div>
              ))}
              {(members ?? []).length === 0 && (
                <p className="text-xs text-[#F1E194]/60 italic">No members assigned</p>
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
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${styles[status] ?? ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

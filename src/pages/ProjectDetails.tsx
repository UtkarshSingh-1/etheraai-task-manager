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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Edit2 } from "lucide-react";

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
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);

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

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("Task updated");
      utils.tasks.listByProject.invalidate({ projectId });
      setEditTask(null);
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
                    createMutation.mutate({ 
                      title, 
                      description, 
                      projectId,
                      assignedTo: assigneeId ? Number(assigneeId) : undefined
                    });
                  }} className="space-y-4 mt-2">
                    <Input placeholder="Task title" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
                    <Textarea placeholder="Description (optional)" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} />
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-neutral-500 uppercase">Assign To</label>
                      <Select value={assigneeId} onValueChange={setAssigneeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="max-h-96">
                          {(members ?? []).map((m) => (
                            <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full bg-[#5B0E14] text-[#F1E194]" disabled={createMutation.isPending}>
                      Create Task
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Edit Task Dialog */}
          <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
              </DialogHeader>
              {editTask && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateMutation.mutate({
                    id: editTask.id,
                    title: editTask.title,
                    description: editTask.description,
                    assignedTo: editTask.assignedTo ? Number(editTask.assignedTo) : null
                  });
                }} className="space-y-4 mt-2">
                  <Input 
                    placeholder="Task title" 
                    value={editTask.title} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTask({...editTask, title: e.target.value})} 
                  />
                  <Textarea 
                    placeholder="Description" 
                    value={editTask.description || ""} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditTask({...editTask, description: e.target.value})} 
                  />
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase">Reassign To</label>
                    <Select 
                      value={editTask.assignedTo?.toString()} 
                      onValueChange={(val) => setEditTask({...editTask, assignedTo: val === "null" ? null : Number(val)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="max-h-96">
                        <SelectItem value="null">Unassigned</SelectItem>
                        {(members ?? []).map((m) => (
                          <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full bg-[#5B0E14] text-[#F1E194]" disabled={updateMutation.isPending}>
                    Save Changes
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>

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
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-neutral-500 truncate">{task.description ?? "No description"}</p>
                    {task.assigneeName && (
                      <>
                        <span className="text-neutral-300">•</span>
                        <p className="text-[10px] font-bold text-[#5B0E14] uppercase tracking-tighter bg-[#F1E194]/30 px-1.5 rounded">
                          {task.assigneeName}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <StatusBadge status={task.status} />
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setEditTask(task)}
                      className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-300 hover:text-neutral-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm("Delete task?")) deleteMutation.mutate({ id: task.id });
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Edit2
} from "lucide-react";
import { toast } from "sonner";

export default function TasksPage() {
  const { isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: users } = trpc.admin.users.useQuery(undefined, { enabled: isAdmin });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task created");
      utils.tasks.list.invalidate();
      setTitle("");
      setDescription("");
      setProjectId("");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Task deleted");
      utils.tasks.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("Task updated");
      utils.tasks.list.invalidate();
      setEditTask(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) {
      toast.error("Title and project are required");
      return;
    }
    createMutation.mutate({
      title,
      description: description || undefined,
      projectId: Number(projectId),
      assignedTo: assigneeId ? Number(assigneeId) : undefined
    });
  };

  const handleStatusChange = (taskId: number, status: "TODO" | "IN_PROGRESS" | "DONE") => {
    updateStatusMutation.mutate({ id: taskId, status });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#5B0E14]">Tasks</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {isAdmin ? "Oversee all team activities" : "Focus on your assigned work"}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#5B0E14] hover:bg-[#4A0B10] text-[#F1E194]">
                <Plus className="w-4 h-4 mr-1.5" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium text-[#5B0E14] block mb-1.5">Title</label>
                  <Input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="Task title" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5B0E14] block mb-1.5">Description</label>
                  <Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder="Optional description" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5B0E14] block mb-1.5">Project</label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-96">
                      {(projects ?? []).map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5B0E14] block mb-1.5">Assign To</label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-96">
                      {(users ?? []).map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-[#5B0E14] text-[#F1E194]" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Task"}
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
              <div>
                <label className="text-sm font-medium text-[#5B0E14] block mb-1.5">Reassign To</label>
                <Select 
                  value={editTask.assignedTo?.toString()} 
                  onValueChange={(val) => setEditTask({...editTask, assignedTo: val === "null" ? null : Number(val)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-96">
                    <SelectItem value="null">Unassigned</SelectItem>
                    {(users ?? []).map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
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
        <AnimatePresence>
          {(tasks ?? []).map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.02 }}
              className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-center gap-5 hover:border-[#5B0E14]/30 hover:shadow-md transition-all duration-200"
            >
              <button
                onClick={() => {
                  const next = task.status === "TODO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "DONE" : "TODO";
                  handleStatusChange(task.id, next);
                }}
                className="shrink-0 group"
              >
                {task.status === "DONE" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : task.status === "IN_PROGRESS" ? (
                  <Clock className="w-6 h-6 text-blue-500 animate-pulse" />
                ) : (
                  <Circle className="w-6 h-6 text-neutral-300 group-hover:text-[#5B0E14] transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-base font-bold truncate ${task.status === "DONE" ? "line-through text-neutral-400" : "text-[#5B0E14]"}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-neutral-500 truncate">{task.description ?? "No description"}</p>
                  {(task as any).assigneeName && (
                    <>
                      <span className="text-neutral-300 text-[10px]">•</span>
                      <p className="text-[10px] font-bold text-[#5B0E14] uppercase tracking-tighter bg-[#F1E194]/30 px-1.5 rounded">
                        {(task as any).assigneeName}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
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
                        if (confirm("Delete this task?")) {
                          deleteMutation.mutate({ id: task.id });
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(tasks ?? []).length === 0 && (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
          <CheckCircle2 className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#5B0E14]">No Tasks Found</h3>
          <p className="text-neutral-400 max-w-xs mx-auto mt-2">
            Assignments will appear here once created. Stay productive!
          </p>
        </div>
      )}
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
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${styles[status] ?? ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

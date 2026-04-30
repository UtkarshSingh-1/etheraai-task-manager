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
} from "lucide-react";
import { toast } from "sonner";

export default function TasksPage() {
  const { isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Tasks</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {isAdmin ? "Manage all tasks" : "Your assigned tasks"}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neutral-900 hover:bg-neutral-800">
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
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">Description</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">Project</label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {(projects ?? []).map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {(tasks ?? []).map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-4"
            >
              <button
                onClick={() => {
                  const next = task.status === "TODO" ? "IN_PROGRESS" : task.status === "IN_PROGRESS" ? "DONE" : "TODO";
                  handleStatusChange(task.id, next);
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
                <p className={`text-sm font-medium truncate ${task.status === "DONE" ? "line-through text-neutral-400" : "text-neutral-900"}`}>
                  {task.title}
                </p>
                <p className="text-xs text-neutral-500 truncate">{task.description ?? "No description"}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={task.status} />
                {task.dueDate && (
                  <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "text-red-500" : "text-neutral-400"}`}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm("Delete this task?")) {
                        deleteMutation.mutate({ id: task.id });
                      }
                    }}
                    className="p-1.5 rounded-md hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(tasks ?? []).length === 0 && (
        <div className="text-center py-16">
          <CheckCircle2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">No tasks found</p>
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
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${styles[status] ?? ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

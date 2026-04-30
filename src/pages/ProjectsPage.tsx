import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { Plus, FolderKanban, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Project created");
      utils.projects.list.invalidate();
      setName("");
      setDescription("");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted");
      utils.projects.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }
    createMutation.mutate({ name, description: description || undefined });
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
          <h1 className="text-2xl font-bold text-neutral-900">Projects</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your team projects</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neutral-900 hover:bg-neutral-800">
                <Plus className="w-4 h-4 mr-1.5" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">Description</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                </div>
                <Button type="submit" className="w-full bg-neutral-900 hover:bg-neutral-800" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {(projects ?? []).map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-neutral-50">
                  <FolderKanban className="w-5 h-5 text-neutral-700" />
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm("Delete this project?")) {
                        deleteMutation.mutate({ id: project.id });
                      }
                    }}
                    className="p-1.5 rounded-md hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-1">{project.name}</h3>
              <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
                {project.description ?? "No description"}
              </p>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(projects ?? []).length === 0 && (
        <div className="text-center py-16">
          <FolderKanban className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">No projects yet</p>
          {isAdmin && (
            <p className="text-sm text-neutral-400 mt-1">Create your first project to get started</p>
          )}
        </div>
      )}
    </div>
  );
}

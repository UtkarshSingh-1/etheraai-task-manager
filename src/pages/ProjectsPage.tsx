import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { Plus, FolderKanban, Trash2, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

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
    <div className="p-4 sm:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#5B0E14]">Projects</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage and track your team projects</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#5B0E14] hover:bg-[#4A0B10] text-[#F1E194]">
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
                  <label className="text-sm font-medium text-[#5B0E14] block mb-1.5">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#5B0E14] block mb-1.5">Description</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                </div>
                <Button type="submit" className="w-full bg-[#5B0E14] text-[#F1E194]" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {(projects ?? []).map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl hover:border-[#5B0E14]/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/projects/${project.id}`}>
                  <ArrowUpRight className="w-5 h-5 text-[#5B0E14]" />
                </Link>
              </div>

              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#5B0E14]/5 text-[#5B0E14]">
                  <FolderKanban className="w-6 h-6" />
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (confirm("Delete this project?")) {
                        deleteMutation.mutate({ id: project.id });
                      }
                    }}
                    className="p-1.5 rounded-md hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Link to={`/projects/${project.id}`} className="block group-hover:translate-x-1 transition-transform duration-300">
                <h3 className="text-lg font-bold text-[#5B0E14] mb-2">{project.name}</h3>
                <p className="text-sm text-neutral-500 mb-6 line-clamp-2 leading-relaxed">
                  {project.description ?? "No description available."}
                </p>
              </Link>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <Link to={`/projects/${project.id}`} className="text-xs font-bold text-[#5B0E14] opacity-0 group-hover:opacity-100 transition-opacity">
                  VIEW DETAILS
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(projects ?? []).length === 0 && (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
          <FolderKanban className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#5B0E14]">No Projects Yet</h3>
          <p className="text-neutral-400 max-w-xs mx-auto mt-2">
            Projects are containers for tasks and team collaboration. Create one to get started!
          </p>
        </div>
      )}
    </div>
  );
}

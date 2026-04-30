import { useEffect } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Briefcase, ArrowRight } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = isAdmin ? "/admin/dashboard" : "/dashboard";
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-neutral-900">Team Task Manager</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="text-sm bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-5xl font-bold text-neutral-900 leading-tight mb-5">
            Manage tasks with your team
          </h1>
          <p className="text-lg text-neutral-500 mb-8 leading-relaxed">
            A clean, role-based task management system for teams. Create projects, assign tasks, and track progress in real-time.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-neutral-700 border border-neutral-200 px-6 py-3 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { title: "Role-Based Access", desc: "Separate admin and member views with proper permissions." },
            { title: "Project Management", desc: "Create projects, add members, and organize work efficiently." },
            { title: "Task Tracking", desc: "Assign tasks, update status, and never miss a deadline." },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="p-6 rounded-2xl border border-neutral-200 bg-white"
            >
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

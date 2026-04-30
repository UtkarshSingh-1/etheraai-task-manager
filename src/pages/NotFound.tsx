import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-neutral-200 mb-2">404</h1>
        <p className="text-lg text-neutral-900 font-medium mb-1">Page not found</p>
        <p className="text-sm text-neutral-500 mb-6">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900 underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}

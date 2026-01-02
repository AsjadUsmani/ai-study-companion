"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Type,
  AlignLeft,
  Save,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Mock router for environment compatibility

type CreateNotePayload = {
  title: string;
  content: string;
};

export default function NewNotePage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateNotePayload>({
    title: "",
    content: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Please provide both a title and some content for your note.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/notes`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create note");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message ||
          "We couldn't save your note. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-4 md:p-12 font-sans selection:bg-violet-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Navigation */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/dashboard")}
          className="group flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-8"
        >
          <div className="p-2 rounded-full group-hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-semibold tracking-wide uppercase text-xs">
            Back to Library
          </span>
        </motion.button>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/30 border border-white/[0.05] backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <div className="p-8 md:p-12 space-y-10">
            {/* Page Title */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-500/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-xs font-black text-violet-400 uppercase tracking-[0.3em]">
                  Editor
                </span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                Create New Entry
              </h1>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-200">{error}</p>
                  </div>
                  <button onClick={() => setError(null)}>
                    <XCircle className="w-5 h-5 text-red-400/50 hover:text-red-400 transition-colors" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inputs */}
            <div className="space-y-8">
              {/* Title Field */}
              <div className="group space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">
                  <Type className="w-3.5 h-3.5" />
                  Note Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a descriptive title..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-neutral-950/50 border border-white/5 group-focus-within:border-violet-500/50 rounded-2xl py-5 px-6 text-xl font-bold text-white placeholder:text-neutral-700 focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all"
                />
              </div>

              {/* Content Field */}
              <div className="group space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">
                  <AlignLeft className="w-3.5 h-3.5" />
                  Content Body
                </label>
                <textarea
                  placeholder="Start typing your thoughts, research, or study notes..."
                  rows={12}
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  className="w-full bg-neutral-950/50 border border-white/5 group-focus-within:border-violet-500/50 rounded-[2rem] py-6 px-6 text-lg text-neutral-300 leading-relaxed placeholder:text-neutral-700 focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all resize-none"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/5">
              <p className="text-sm text-neutral-500 font-medium italic">
                {form.content.trim().split(/\s+/).filter(Boolean).length} words
                typed
              </p>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 sm:flex-none px-8 py-4 rounded-2xl font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-white text-black hover:bg-neutral-200 px-10 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 stroke-[2.5]" />
                  )}
                  {loading ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

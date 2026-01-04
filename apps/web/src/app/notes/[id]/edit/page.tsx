"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Save,
  Trash2,
  Clock,
  PenLine,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Toast from "@/components/Toast"; // Using your external Toast

type NoteForm = {
  title: string;
  content: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function EditNotePage() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState<NoteForm>({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/notes/${id}`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data) {
          setForm({
            title: data.title,
            content: data.content,
          });
        }
      })
      .catch(() => setError("Failed to load note."))
      .finally(() => setLoading(false));
  }, [id, router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showToast("Title and content cannot be empty");
      return;
    }

    setSaving(true);
    
    try {
      const res = await fetch(`${BACKEND_URL}/notes/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save note");
      
      setLastSaved(new Date());
      showToast("Note saved! AI summary cleared.");
      
      // Optional: Redirect immediately or let user keep editing
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      showToast("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // Simple inline confirmation using window.confirm as a failsafe, 
    // or you can implement a custom modal. 
    // Given the previous request to remove confirmation, I'll allow direct delete
    // but with a loading state to prevent double-clicks.
    
    setDeleting(true);

    try {
      const res = await fetch(`${BACKEND_URL}/notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete note");

      showToast("Note deleted successfully");
      router.push("/dashboard");
    } catch (err) {
      showToast("Failed to delete note.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 p-4 md:p-12 font-sans selection:bg-violet-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors group"
          >
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm tracking-wide">LIBRARY</span>
          </motion.button>

          {lastSaved && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20"
            >
              <Clock className="w-3 h-3" />
              Saved at {lastSaved.toLocaleTimeString()}
            </motion.div>
          )}
        </div>

        {/* Main Editor Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/40 border border-white/5 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-2xl"
        >
          {/* Editor Toolbar / Header */}
          <div className="px-8 py-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-500/10 rounded-xl">
                <PenLine className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Edit Mode</h1>
                <p className="text-xs text-neutral-500">Changes will reset AI summaries</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all disabled:opacity-50"
                title="Delete Note"
              >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold transition-all shadow-lg shadow-white/5 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="p-8 md:p-10 space-y-8">
            <div className="space-y-6">
              <input
                type="text"
                placeholder="Note Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-transparent text-4xl md:text-5xl font-black text-white placeholder:text-neutral-700 focus:outline-none"
              />
              
              <textarea
                placeholder="Start typing your content here..."
                rows={15}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full bg-transparent text-lg text-neutral-300 leading-relaxed placeholder:text-neutral-700 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              />
            </div>
            
            {/* Word Count Footer */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between text-xs font-bold text-neutral-600 uppercase tracking-widest">
              <span>{form.content.length} Characters</span>
              <span>{form.content.trim().split(/\s+/).filter(Boolean).length} Words</span>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} />}
      </AnimatePresence>
    </div>
  );
}
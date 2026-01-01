"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Loader2,
  Bot,
  FileText,
  BrainCircuit,
} from "lucide-react";
import Navbar from "@/components/Navbar";

type Note = {
  id: string;
  title: string;
  content: string;
  summary?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  // --- Fetch Notes Logic (Unchanged Routes) ---
  useEffect(() => {
    let isMounted = true;

    const fetchNotes = async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
          }/notes`,
          { credentials: "include" }
        );

        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (isMounted) {
          if (Array.isArray(data)) {
            setNotes(data);
          } else {
            console.error("Received non-array data:", data);
            setNotes([]);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (isMounted) setNotes([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotes();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // --- Summarize Logic (Unchanged Routes) ---
  const summarizeNote = async (noteId: string) => {
    setSummarizingId(noteId);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/notes/summarize`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ noteId }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === noteId ? { ...note, summary: data.summary } : note
          )
        );
      }
    } catch (error) {
      console.error("Summarization failed:", error);
    } finally {
      setSummarizingId(null);
    }
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-sm font-medium tracking-wide">
            Syncing your knowledge base...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-violet-500/30">
        {/* Background Gradient Effect */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-neutral-950 to-neutral-950 pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <header className="mb-12 flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-600/20 rounded-lg border border-violet-500/30">
                <BrainCircuit className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Study Companion
                </h1>
                <p className="text-neutral-500 text-sm">
                  AI-powered knowledge management
                </p>
              </div>
            </div>
          </header>

          {/* Content Grid */}
          {notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/50"
            >
              <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-neutral-300">
                No notes found
              </h3>
              <p className="text-neutral-500 mt-2">
                Start taking notes to see them here.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  variants={itemVariants}
                  layout
                  className="group relative flex flex-col bg-neutral-900/60 backdrop-blur-sm border border-white/5 rounded-xl hover:border-violet-500/30 hover:bg-neutral-900/80 transition-all duration-300 overflow-hidden shadow-lg shadow-black/20"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4 flex-grow">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-semibold text-lg text-white group-hover:text-violet-200 transition-colors">
                        {note.title}
                      </h3>
                      <FileText className="w-5 h-5 text-neutral-600 group-hover:text-neutral-500 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed line-clamp-4">
                      {note.content}
                    </p>
                  </div>

                  {/* AI Summary Section (Animated) */}
                  <AnimatePresence>
                    {note.summary && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-violet-950/30 border-t border-violet-500/20"
                      >
                        <div className="p-4 relative">
                          {/* Glowing accent line */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500/50" />

                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-4 h-4 text-violet-400" />
                            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                              AI Summary
                            </span>
                          </div>
                          <p className="text-sm text-violet-100/80 leading-relaxed">
                            {note.summary}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Card Footer / Action Button */}
                  <div className="p-4 pt-2 mt-auto border-t border-white/5 bg-neutral-900/40">
                    <button
                      onClick={() => summarizeNote(note.id)}
                      disabled={summarizingId === note.id || !!note.summary}
                      className={`
                      w-full relative overflow-hidden flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all
                      ${
                        note.summary
                          ? "bg-transparent text-neutral-500 cursor-default"
                          : "bg-white/5 hover:bg-violet-600 hover:text-white text-neutral-300 border border-white/10 hover:border-violet-500"
                      }
                      ${
                        summarizingId === note.id
                          ? "opacity-80 cursor-wait"
                          : ""
                      }
                    `}
                    >
                      {summarizingId === note.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : note.summary ? (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Summarized</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate AI Summary</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

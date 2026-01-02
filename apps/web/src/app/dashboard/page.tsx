"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Clock,
  LayoutGrid,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import NoteSkeleton from "@/components/NoteSkeleton";
import Toast from "@/components/Toast";
import { useRouter } from "next/navigation";

type Note = {
  id: string;
  title: string;
  content: string;
  summary?: string;
  created_at: string;
};

/**
 * Render the dashboard UI for browsing, searching, summarizing, and tutoring on notes.
 *
 * Displays a paginated list of notes with search, per-note AI summarization, and a per-note AI tutor (question input and answer display). Handles loading and error states, shows total note count, and provides navigation to create a new note.
 *
 * @returns The Dashboard page component rendering the notes library with search, pagination, AI summarization, and per-note AI tutor features.
 */
export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();
  const [questions, setQuestions] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [askingId, setAskingId] = useState<string | null>(null);

  const limit = 5;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
      }/notes?search=${encodeURIComponent(
        debouncedSearch
      )}&page=${page}&limit=${limit}`,
      { credentials: "include" }
    )
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        // Handle potential undefined notes from backend bug
        if (!data) return;
        setNotes(data.notes || []);
        setTotal(data.total || 0);
      })
      .catch(() => setError("Failed to load notes"))
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  const handleSummarize = async (noteId: string) => {
    setSummarizingId(noteId);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/notes/summarize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ noteId }),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId ? { ...n, summary: data.summary } : n
          )
        );
        setToast("Summary generated successfully");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error("Summarize error:", err);
    } finally {
      setSummarizingId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Your Library
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Manage and summarize your study materials.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-violet-900/20 active:scale-95" onClick={() => router.push('/notes/new')}>
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </header>

        {/* Search & Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-violet-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by title or content..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-neutral-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            />
          </div>
          <div className="bg-neutral-900/50 border border-white/10 rounded-2xl px-6 py-3 flex items-center justify-center gap-3">
            <BookOpen className="w-5 h-5 text-violet-400" />
            <span className="font-bold text-white">{total}</span>
            <span className="text-neutral-500 text-sm">Notes</span>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="space-y-4 relative min-h-100">
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <NoteSkeleton key={i} />
              ))}
            </div>
          ) : notes.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {toast && <Toast message={toast} />}
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-neutral-900/40 border border-white/5 backdrop-blur-sm rounded-2xl overflow-hidden hover:border-white/10 transition-colors group"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-neutral-700" />
                          <span>
                            {Math.ceil(note.content.split(" ").length / 200)}{" "}
                            min read
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSummarize(note.id)}
                        disabled={summarizingId === note.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                          ${
                            note.summary
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20"
                          }`}
                      >
                        {summarizingId === note.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        {note.summary ? "Summarized" : "AI Summarize"}
                      </button>
                    </div>

                    <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">
                      {note.content}
                    </p>

                    {note.summary && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-4 mt-4"
                      >
                        <div className="flex items-center gap-2 mb-2 text-violet-400">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-tighter">
                            AI Summary
                          </span>
                        </div>
                        <p className="text-neutral-300 text-sm italic leading-relaxed">
                          {note.summary}
                        </p>
                      </motion.div>
                    )}
                    <div className="mt-4 space-y-2">
                      <input
                        type="text"
                        placeholder="Ask AI Tutor (e.g. Explain this like I'm 10)"
                        value={questions[note.id] || ""}
                        onChange={(e) =>
                          setQuestions((prev) => ({
                            ...prev,
                            [note.id]: e.target.value,
                          }))
                        }
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-sm"
                      />

                      <button
                        disabled={askingId === note.id}
                        onClick={async () => {
                          const question = questions[note.id];
                          if (!question || question.trim().length < 5) return;

                          setAskingId(note.id);

                          try {
                            const res = await fetch(
                              `${
                                process.env.NEXT_PUBLIC_BACKEND_URL ||
                                "http://localhost:5000"
                              }/notes/tutor`,
                              {
                                method: "POST",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  noteId: note.id,
                                  question,
                                }),
                              }
                            );

                            const data = await res.json();

                            if (res.ok) {
                              setAnswers((prev) => ({
                                ...prev,
                                [note.id]: data.answer,
                              }));
                            }
                          } catch (err) {
                            console.error("Tutor error:", err);
                          } finally {
                            setAskingId(null);
                          }
                        }}
                        className="text-xs px-3 py-1 bg-violet-600 rounded"
                      >
                        {askingId === note.id ? "Thinking..." : "Ask Tutor"}
                      </button>

                      {answers[note.id] && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded text-sm">
                          <strong>AI Tutor:</strong>
                          <p>{answers[note.id]}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-600 border-2 border-dashed border-white/5 rounded-3xl">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p>No notes found matching your search.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4 pb-12">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-400 disabled:opacity-20 hover:text-white transition-all active:scale-90"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                    page === n
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                      : "bg-neutral-900 text-neutral-500 hover:text-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-400 disabled:opacity-20 hover:text-white transition-all active:scale-90"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
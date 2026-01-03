"use client";

import React, { useEffect, useState } from "react";
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
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import Toast from "@/components/Toast";
import NoteSkeleton from "@/components/NoteSkeleton";

// --- Internal Utilities & Components (maintained for preview functionality) ---

type Note = {
  id: string;
  title: string;
  content: string;
  summary?: string;
  created_at: string;
};

const BACKEND_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000")
  : "";

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI Tutor & Quiz State
  const [questions, setQuestions] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [askingId, setAskingId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Record<string, any[]>>({});
  const [quizLoadingId, setQuizLoadingId] = useState<string | null>(null);
  const router = useRouter();
  const limit = 5;


  // Mock router for preview
  

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${BACKEND_URL}/notes?search=${encodeURIComponent(
            debouncedSearch
          )}&page=${page}&limit=${limit}`,
          { credentials: "include" }
        );
        
        if (res.status === 401) {
          setError("Session expired. Please login.");
          return;
        }

        const data = await res.json();
        setNotes(data.notes || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError("Failed to load notes. Please check backend connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [debouncedSearch, page]);

  const handleSummarize = async (noteId: string) => {
    setSummarizingId(noteId);
    try {
      const res = await fetch(`${BACKEND_URL}/notes/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId ? { ...n, summary: data.summary } : n
          )
        );
        Toast({message: "Summary generated successfully"});
      }
    } catch (err) {
      Toast({message: "Summarize error"});
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
          <button
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-violet-900/20 active:scale-95"
            onClick={() => router.push("/notes/new")}
          >
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
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <NoteSkeleton key={i} />
              ))}
            </div>
          ) : notes.length > 0 ? (
            <AnimatePresence mode="popLayout">
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
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
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

                        <button
                          disabled={quizLoadingId === note.id}
                          onClick={async () => {
                            setQuizLoadingId(note.id);
                            try {
                              const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/notes/quiz`, {
                                method: "POST",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ noteId: note.id }),
                              });

                              const data = await res.json();
                              setQuiz((prev) => ({ ...prev, [note.id]: data.questions }));
                            } catch (error) {
                              console.error(error);
                              Toast({message: "Failed to generate quiz"});
                            } finally {
                              setQuizLoadingId(null);
                            }
                          }}
                          className="text-xs px-3 py-1 bg-indigo-600 rounded text-white font-bold"
                        >
                          {quizLoadingId === note.id ? "Generating..." : "Generate Quiz"}
                        </button>
                      </div>
                    </div>

                    <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">
                      {note.content}
                    </p>

                    {/* AI Summary Section */}
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

                    {/* Quiz Section - Simplified Render */}
                    {quiz[note.id] && (
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-indigo-400 uppercase">Practice Quiz</h4>
                          <button onClick={() => setQuiz(prev => { const n = {...prev}; delete n[note.id]; return n; })}><X className="w-3 h-3 text-neutral-500 hover:text-white" /></button>
                        </div>
                        {quiz[note.id].map((q, i) => (
                          <div key={i} className="bg-neutral-800 p-3 rounded text-sm">
                            {q.type === "qa" ? (
                              <>
                                <p><strong>Q:</strong> {q.question}</p>
                                <p className="text-neutral-400 mt-1"><strong>A:</strong> {q.answer}</p>
                              </>
                            ) : (
                              <>
                                <p><strong>Front:</strong> {q.front}</p>
                                <p className="text-neutral-400 mt-1"><strong>Back:</strong> {q.back}</p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tutor Chat Input - Simplified */}
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                      <div className="flex items-center gap-3">
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
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-violet-500"
                        />
                        <button
                          disabled={askingId === note.id}
                          onClick={async () => {
                            const question = questions[note.id];
                            if (!question || question.trim().length < 5) return;

                            setAskingId(note.id);
                            try {
                              const res = await fetch(`${BACKEND_URL}/notes/tutor`, {
                                method: "POST",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  noteId: note.id,
                                  question,
                                }),
                              });
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
                          className="text-xs px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded font-bold whitespace-nowrap min-w-[80px]"
                        >
                          {askingId === note.id ? "Thinking..." : "Ask Tutor"}
                        </button>
                      </div>

                      {answers[note.id] && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded text-sm">
                          <strong className="block text-emerald-400 mb-1">AI Tutor:</strong>
                          <p className="text-neutral-300">{answers[note.id]}</p>
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
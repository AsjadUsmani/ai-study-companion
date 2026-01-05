"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  AlertCircle,
  X,
  PenLine,
  Trash2,
  MessageSquare,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import toast, { Toaster } from "react-hot-toast";
import NoteSkeleton from "@/components/NoteSkeleton";

type Note = {
  id: string;
  title: string;
  content: string;
  summary?: string;
  created_at: string;
};

// Types for the Quiz structure based on your Python backend
type Question = {
  question: string;
  options?: string[];
  answer: string;
  type?: string; 
};

const BACKEND_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // AI Tutor & Quiz State
  const [questions, setQuestions] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [askingId, setAskingId] = useState<string | null>(null);
  
  // Updated Quiz State to handle the Question type array
  const [quiz, setQuiz] = useState<Record<string, Question[]>>({});
  const [quizLoadingId, setQuizLoadingId] = useState<string | null>(null);
  
  const router = useRouter();
  const limit = 5;

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
    const toastId = toast.loading("Generating AI summary...");

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
        toast.success("Summary generated successfully!", { id: toastId });
      } else {
        toast.error("Failed to generate summary", { id: toastId });
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.", { id: toastId });
    } finally {
      setSummarizingId(null);
    }
  };

  const handleGenerateQuiz = async (noteId: string) => {
    if (quizLoadingId === noteId) return;
    setQuizLoadingId(noteId);
    const toastId = toast.loading("Generating MCQs...");

    // Clear old quiz if exists
    setQuiz((prev) => {
        const n = { ...prev };
        delete n[noteId];
        return n;
    });

    try {
        const res = await fetch(`${BACKEND_URL}/notes/quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noteId }),
            credentials: "include",
        });

        if (res.status === 429) {
            toast.error("AI is busy. Please wait a moment.", { id: toastId });
            return;
        }

        const data = await res.json();

        if (res.ok && data.questions) {
            setQuiz((prev) => ({
                ...prev,
                [noteId]: data.questions,
            }));
            toast.success("Quiz generated!", { id: toastId });
        } else {
            toast.error("Failed to generate quiz", { id: toastId });
        }
    } catch (error) {
        toast.error("Network error.", { id: toastId });
    } finally {
        setQuizLoadingId(null);
    }
  };

  const handleTutor = async (noteId: string) => {
    const question = questions[noteId];
    if (!question || question.trim().length < 5) {
        toast.error("Please enter a longer question");
        return;
    }

    setAskingId(noteId);
    const toastId = toast.loading("AI Tutor is thinking...");

    try {
        const res = await fetch(`${BACKEND_URL}/notes/tutor`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noteId, question }),
        });

        if (res.status === 429) {
            toast.error("AI Limit Reached. Wait 1 min.", { id: toastId });
            return;
        }

        const data = await res.json();
        if (res.ok) {
            setAnswers((prev) => ({ ...prev, [noteId]: data.answer }));
            toast.success("Answer received", { id: toastId });
        } else {
            toast.error("Tutor failed to respond", { id: toastId });
        }
    } catch (err) {
        toast.error("Network error", { id: toastId });
    } finally {
        setAskingId(null);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      return;
    }

    setDeletingId(noteId);
    const toastId = toast.loading("Deleting note...");

    try {
      const res = await fetch(`${BACKEND_URL}/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        setTotal((prev) => prev - 1);
        toast.success("Note deleted successfully!", { id: toastId });
      } else {
        toast.error("Failed to delete note", { id: toastId });
      }
    } catch (err) {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-6 font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#171717",
            color: "#e5e5e5",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      />

      <div className="max-w-5xl mx-auto space-y-8">
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

        {/* Search */}
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
                          onClick={() => handleGenerateQuiz(note.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
                        >
                          {quizLoadingId === note.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Generate Quiz"
                          )}
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

                    {/* QUIZ SECTION (MCQ ONLY) */}
                    {quiz[note.id] && quiz[note.id].length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 space-y-4"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" /> Practice Quiz
                          </h4>
                          <button
                            onClick={() =>
                              setQuiz((prev) => {
                                const n = { ...prev };
                                delete n[note.id];
                                return n;
                              })
                            }
                            className="p-1 hover:bg-white/5 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-neutral-500 hover:text-white" />
                          </button>
                        </div>

                        <div className="grid gap-3">
                          {quiz[note.id].map((q, i) => (
                            <div
                              key={i}
                              className="bg-neutral-800/50 border border-white/5 p-4 rounded-xl text-sm hover:border-indigo-500/20 transition-colors"
                            >
                              {/* Question Text */}
                              <p className="font-medium text-white mb-3">
                                <span className="text-indigo-400 font-bold mr-2">{i + 1}.</span>
                                {q.question}
                              </p>

                              {/* MCQ Options */}
                              {q.options && Array.isArray(q.options) && (
                                <div className="grid gap-2 pl-4 mb-3">
                                  {q.options.map((opt, idx) => (
                                    <div key={idx} className="flex items-start gap-3 text-neutral-400 text-xs">
                                      <div className="min-w-[20px] h-[20px] rounded-full border border-neutral-700 flex items-center justify-center text-[10px] font-bold bg-neutral-900 mt-0.5 text-neutral-500">
                                        {String.fromCharCode(65 + idx)}
                                      </div>
                                      <span className="leading-5">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Answer Reveal Toggle */}
                              <details className="group">
                                <summary className="text-[10px] uppercase tracking-widest text-neutral-500 cursor-pointer hover:text-emerald-400 transition-colors list-none flex items-center gap-2 select-none">
                                  <span>Check Answer</span>
                                </summary>
                                <div className="mt-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-2 rounded-lg inline-block border border-emerald-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
                                  Correct Option: {q.answer}
                                </div>
                              </details>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Tutor Chat Input */}
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
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
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleTutor(note.id);
                            }}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                        <button
                          disabled={askingId === note.id}
                          onClick={() => handleTutor(note.id)}
                          className="text-xs px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded font-bold whitespace-nowrap min-w-[80px]"
                        >
                          {askingId === note.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            "Ask Tutor"
                          )}
                        </button>
                      </div>

                      {answers[note.id] && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded text-sm animate-in fade-in slide-in-from-top-2">
                          <strong className="block text-emerald-400 mb-1 text-xs uppercase tracking-wider">
                            AI Tutor Response
                          </strong>
                          <p className="text-neutral-300 leading-relaxed">{answers[note.id]}</p>
                        </div>
                      )}
                    </div>

                    {/* Edit & Delete Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                      <button
                        onClick={() => router.push(`/notes/${note.id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800/50 border border-white/5 text-neutral-400 hover:text-white hover:bg-neutral-800 hover:border-white/10 transition-all group"
                        title="Edit Note"
                      >
                        <PenLine className="w-4 h-4 group-hover:text-violet-400 transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Edit
                        </span>
                      </button>

                      <button
                        onClick={() => handleDelete(note.id)}
                        disabled={deletingId === note.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/5 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        title="Delete Note"
                      >
                        {deletingId === note.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 group-hover:text-red-300 transition-colors" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {deletingId === note.id ? "Deleting..." : "Delete"}
                        </span>
                      </button>
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
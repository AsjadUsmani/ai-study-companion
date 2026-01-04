"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Sparkles,
  FileText,
  MessageSquare,
  Zap,
  LineChart,
  ArrowRight,
  CheckCircle2,
  LogIn,
  LayoutDashboard,
  LogOut,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function App() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
          }/user/me`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setUser({ id: data.userId, email: data.email || "" }); // Minimal state from your /me route
        }
        setAuthError(null);
      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthError("Unable to verify authentication. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/auth/logout`,
        { method: "POST", credentials: "include" }
      );
      if (res.ok) {
        setUser(null);
        router.refresh();
      } else {
        console.error("Logout failed with status:", res.status);
        alert("Failed to log out. Please try again.");
      }
    } catch (err) {
      console.error("Logout failed:", err);
      alert("An error occurred during logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const features = [
    {
      title: "Smart Summarization",
      description:
        "Upload your messy lecture notes or PDFs and get a structured, concise summary in seconds.",
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "AI Tutor Mode",
      description:
        "Ask questions like 'Explain this like I'm 10' and get intuitive, human-like explanations.",
      icon: MessageSquare,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      title: "Instant Quizzes",
      description:
        "Auto-generate practice questions and flashcards directly from your study materials.",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Progress Tracking",
      description:
        "Visualize your learning journey and identify topics that need more attention.",
      icon: LineChart,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-violet-500/30 overflow-x-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 bg-neutral-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="w-10 h-10 rounded-xl bg-[#050505] flex items-center justify-center shadow-lg shadow-violet-600/20 group-hover:scale-110 transition-transform">
              <Logo />
            </div>
            <span className="font-bold text-xl text-white tracking-tighter">
              Synapse
            </span>
          </div>

          <div className="flex items-center gap-6">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all border border-white/10"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-xl transition-all border border-red-500/20"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="cursor-pointer text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="cursor-pointer px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-violet-600/20 active:scale-95"
                >
                  Join Free
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black tracking-[0.2em] uppercase mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Learning Suite</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tightest mb-8 leading-[0.9]"
          >
            Study{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
              Smarter
            </span>
            ,<br />
            Not Harder.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-xl text-neutral-400 leading-relaxed mb-12 font-medium"
          >
            Your intelligent study companion that summarizes notes, explains
            complex topics, and tracks your progress using cutting-edge AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-10 py-5 bg-white text-black rounded-2xl font-black flex items-center gap-3 transition-all shadow-2xl hover:bg-neutral-200 group active:scale-95"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/register")}
                  className="cursor-pointer w-full sm:w-auto px-10 py-5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-violet-600/20 group active:scale-95"
                >
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="cursor-pointer w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </button>
              </>
            )}
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white tracking-tight">
                Master Any Subject
              </h2>
              <p className="text-neutral-500 text-lg font-medium">
                Core features designed to supercharge your learning.
              </p>
            </div>
            <div className="hidden md:block h-px flex-1 mx-12 bg-white/5" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-10 rounded-[2.5rem] bg-neutral-900/40 border border-white/5 backdrop-blur-sm hover:border-violet-500/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                  <feature.icon className={`w-24 h-24 ${feature.color}`} />
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 text-base leading-relaxed font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Why Us */}
        <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div className="space-y-8">
                <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
                  Designed for the <br />
                  <span className="text-neutral-600">Modern Student</span>
                </h2>
                <div className="grid gap-6">
                  {[
                    "AI service powered by specialized study models",
                    "Cross-platform access for learning on the go",
                    "Secure and private storage for all your data",
                    "Seamless PDF and document integration",
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-5 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-neutral-300 font-bold text-lg">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-neutral-900/50 group shadow-2xl"
            >
              <div className="aspect-square sm:aspect-video bg-gradient-to-br from-violet-600/20 to-blue-600/10 flex items-center justify-center">
                <BrainCircuit className="w-32 h-32 text-violet-500/20 group-hover:scale-110 transition-transform duration-1000" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-8 left-8 right-8 p-8 rounded-3xl bg-neutral-900/90 backdrop-blur-2xl border border-white/10 shadow-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                  <span className="text-xs text-violet-400 font-black uppercase tracking-[0.3em]">
                    AI Tutor Insight
                  </span>
                </div>
                <p className="text-lg font-bold text-white italic leading-relaxed">
                  "Explain the concept of Neural Networks like I'm 10."
                </p>
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em]">
                    Optimizing Response...
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#050505] flex items-center justify-center">
              <Logo />
            </div>
            <span className="font-bold text-white tracking-tight">
              Synapse
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm font-bold text-neutral-500">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Twitter
            </a>
          </div>
          <p className="text-neutral-600 text-xs font-medium">
            © {new Date().getFullYear()} Synapse AI.
          </p>
        </footer>
      </div>
    </div>
  );
}

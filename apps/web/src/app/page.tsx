"use client";

import React, { useState } from "react";
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
  UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";
// Mock router functionality for the preview environment


export default function App() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const features = [
    {
      title: "Smart Summarization",
      description: "Upload your messy lecture notes or PDFs and get a structured, concise summary in seconds.",
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      title: "AI Tutor Mode",
      description: "Ask questions like 'Explain this like I'm 10' and get intuitive, human-like explanations.",
      icon: MessageSquare,
      color: "text-violet-400",
      bg: "bg-violet-500/10"
    },
    {
      title: "Instant Quizzes",
      description: "Auto-generate practice questions and flashcards directly from your study materials.",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      title: "Progress Tracking",
      description: "Visualize your learning journey and identify topics that need more attention.",
      icon: LineChart,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-violet-500/30 overflow-x-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      {/* Simple Navigation for Landing */}
      <nav className="relative z-50 border-b border-white/5 bg-neutral-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-white tracking-tight">Study Companion</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/login")}
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => router.push("/register")}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-lg transition-all"
            >
              Join Free
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold tracking-widest uppercase mb-8"
          >
            <Sparkles className="w-3 h-3" />
            <span>Highly Recommended ⭐</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6"
          >
            Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Smarter</span>,<br />Not Harder.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-lg text-neutral-400 leading-relaxed mb-10"
          >
            Your intelligent study companion that summarizes notes, explains complex topics, 
            and tracks your progress using cutting-edge AI.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => router.push("/register")}
              className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-violet-900/20 group"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => router.push("/login")}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Master Any Subject</h2>
            <p className="text-neutral-500">Core features designed to supercharge your learning.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-8 rounded-2xl bg-neutral-900/40 border border-white/5 backdrop-blur-sm hover:border-violet-500/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Interactive "Why Choose Us" Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">
                Designed for the <br />Modern Student
              </h2>
              <div className="space-y-6">
                {[
                  "AI service powered by specialized study models",
                  "Cross-platform access for learning on the go",
                  "Secure and private storage for all your data",
                  "Seamless PDF and document integration"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-neutral-300 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/50 group"
            >
              <div className="aspect-video bg-gradient-to-br from-violet-600/10 to-blue-600/10 flex items-center justify-center">
                <BrainCircuit className="w-24 h-24 text-violet-500/20 group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Query</span>
                </div>
                <p className="text-sm font-medium text-white italic leading-relaxed">
                  "Explain the concept of Neural Networks like I'm 10."
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">AI Generating Answer...</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-violet-400" />
            <span className="font-bold text-white tracking-tight">Study Companion</span>
          </div>
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} AI Study Companion. Built for the future of learning.
          </p>
        </footer>
      </div>
    </div>
  );
}
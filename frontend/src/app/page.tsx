"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  FileText,
  Brain,
  BarChart3,
  RefreshCcw,
  Smartphone,
  Quote,
  Star,
  Zap,
  Award,
  Sparkles,
  Play,
  Globe,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [demoStep, setDemoStep] = useState(0); // 0: Question, 1: Result
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const mcqData = {
    question: "What is the primary function of Mitochondria in a human cell?",
    options: [
      { id: "A", text: "Energy production (ATP Synthesis)" },
      { id: "B", text: "Protein synthesis" },
      { id: "C", text: "DNA replication" },
      { id: "D", text: "Cell division" }
    ],
    correctId: "A",
    explanation: "Mitochondria are known as the 'powerhouse of the cell' because they generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy."
  };

  const handleAnswer = (id: string) => {
    setSelectedOption(id);
    setDemoStep(1);
  };

  return (
    <div className="min-h-screen bg-mesh selection:bg-brand-primary/20 overflow-x-hidden">
      <Navbar />

      <main>
        {/* SECTION 1: PREMIUM FULL-SCREEN HERO */}
        <section className="relative overflow-hidden min-h-[85svh] md:min-h-[100svh]" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #eff6ff 100%)' }}>
          {/* Background blobs */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-primary/8 rounded-full blur-[100px] animate-slow-spin" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-secondary/6 rounded-full blur-[80px]" />

          {/* Full-height column */}
          <div className="relative z-10 flex flex-col min-h-[85svh] md:min-h-[100svh]">

            {/* Top spacing — generous gap below navbar on mobile */}
            <div className="h-24 md:h-32 lg:h-24 flex-shrink-0" />

            {/* Main hero content */}
            <div className="flex-1 flex flex-col justify-center container">

              {/* Desktop: 2-col grid; Mobile: single col */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">

                {/* Left col — always visible */}
                <div>
                  {/* Eyebrow badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="eyebrow-amazing mb-8 md:mb-5"
                  >
                    <Sparkles size={12} className="animate-pulse" />
                    Official Past Papers &amp; Topic-Wise MCQs
                  </motion.div>

                  {/* Main heading */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-[2.5rem] sm:text-5xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-slate-900 mb-8 md:mb-5 mt-0"
                  >
                    Master the<br />
                    MDCAT{" "}<span className="text-brand-primary italic">Smarter.</span>
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-base md:text-xl text-slate-500 font-medium leading-relaxed mb-7 max-w-sm md:max-w-lg"
                  >
                    Stop wasting time on disorganized PDFs. Get structured practice and instant explanations.
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex gap-3 mb-6"
                  >
                    <Link href="/register" className="btn-amazing !py-4 !px-5 flex-1 sm:flex-none sm:!px-10 text-center text-[15px]">
                      Create Account
                    </Link>
                    <Link href="/login" className="btn-amazing-outline !py-4 !px-5 flex-1 sm:flex-none sm:!px-10 text-center text-[15px]">
                      Login
                    </Link>
                  </motion.div>

                  {/* Social proof */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="flex items-center gap-2 mb-8"
                  >
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[9px] shadow-sm">👨‍⚕️</div>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Trusted by 200+ Students</span>
                  </motion.div>

                  {/* Animated stat pills — mobile only - REMOVED */}
                </div>

                {/* Right col — desktop image only */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, rotate: 4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 1, type: "spring" }}
                  className="relative hidden lg:block"
                >
                  <div className="relative z-10 animate-bop shadow-2xl rounded-[2.5rem] overflow-hidden border-4 border-white max-w-[500px] ml-auto">
                    <Image src="/hero-mdcat.png" alt="PrepBuddy MDCAT Study Visual" width={500} height={500} className="w-full h-auto" />
                  </div>
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute -bottom-6 -right-6 amazing-card !p-4 shadow-xl z-20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-brand-secondary">
                        <Star size={20} fill="currentColor" />
                      </div>
                      <div>
                        <div className="text-lg font-bold italic tracking-tighter">20,000+</div>
                        <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Solved MCQs</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

              </div>
            </div>

            {/* Scroll indicator — mobile only */}
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="pb-5 flex flex-col items-center gap-1 lg:hidden"
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Scroll</span>
              <div className="w-5 h-8 border-2 border-slate-200 rounded-full flex items-start justify-center pt-1">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-brand-primary rounded-full"
                />
              </div>
            </motion.div>

          </div>
        </section>

        {/* SECTION 2: COMPACT STATS GRID (MOBILE-READY) */}
        <section className="py-6 md:py-10 relative bg-white border-y border-slate-50">
          <div className="container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
              {[
                { title: "15 Years", subtitle: "Archive", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                { title: "20,000+", subtitle: "Questions", icon: Brain, color: "text-emerald-600", bg: "bg-emerald-50" },
                { title: "98% Reach", subtitle: "Accuracy", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
                { title: "Real-time", subtitle: "Analytics", icon: Zap, color: "text-purple-600", bg: "bg-purple-50" }
              ].map((stat, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="amazing-card !p-4 md:!p-8 text-center hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-xl border border-slate-100 group"
                >
                  <div className={`w-12 h-12 md:w-16 md:h-16 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:rotate-6 transition-transform shadow-inner`}>
                    <stat.icon size={24} className="md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 italic tracking-tighter mb-1">{stat.title}</h3>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">{stat.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* SECTION 4: THE PREPARATION GAP (STRATEGY) */}
        <section className="py-10 md:py-12 bg-slate-50 relative">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 lg:pl-10">
                <div className="eyebrow-amazing">Why PrepBuddy?</div>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight text-gradient">
                  Academies are expensive. <br />
                  <span className="text-brand-primary">PrepBuddy is smart.</span>
                </h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                  Most students fail not because they don't study, but because they study unorganized content. PrepBuddy gives you the structure of an elite academy for free.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  {[
                    "Organized Content",
                    "Expert Explanations",
                    "Real-time Tracking",
                    "Daily Rank Analysis"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-brand-primary">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex justify-center lg:justify-end">
                <div className="amazing-card !p-6 md:!p-8 relative overflow-hidden group border-2 border-brand-primary/10 max-w-lg lg:max-w-md">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-3xl rounded-full" />

                  <div className="space-y-6 relative z-10">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-3 text-red-500 font-bold text-[10px] uppercase tracking-widest">
                        <XCircle size={12} /> The Old Way
                      </div>
                      <p className="text-slate-400 font-bold line-through italic text-sm">Expensive academies, heavy bags, and random PDFs with no proper keys.</p>
                    </div>

                    <div className="p-6 bg-emerald-50 rounded-2xl border border-brand-primary/20 animate-shimmer">
                      <div className="flex items-center gap-3 mb-3 text-brand-primary font-bold text-[10px] uppercase tracking-widest">
                        <Sparkles size={12} /> The PrepBuddy Way
                      </div>
                      <p className="text-emerald-900 font-bold text-lg italic leading-tight">"All your preparation, tracked, analyzed, and perfected in one tiny browser tab."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: SUBJECT DISCOVERY (CONTENT SHOWCASE) */}
        <section className="py-10 md:py-20 relative overflow-hidden">
          <div className="container">
            <div className="text-left md:text-center mb-8 space-y-3">
              <div className="eyebrow-amazing">Subject Mastery</div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need to <span className="text-brand-primary">Succeed.</span></h2>
              <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                Carefully curated questions for every subject, mapped exactly to the latest UHS and PMDC syllabus.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { name: "Biology", count: "8,500+ MCQs", icon: Brain, color: "from-emerald-500/20 to-emerald-500/0", border: "hover:border-emerald-500/50" },
                { name: "Chemistry", count: "6,200+ MCQs", icon: Sparkles, color: "from-blue-500/20 to-blue-500/0", border: "hover:border-blue-500/50" },
                { name: "Physics", count: "4,800+ MCQs", icon: Zap, color: "from-amber-500/20 to-amber-500/0", border: "hover:border-amber-500/50" },
                { name: "English", count: "1,500+ MCQs", icon: FileText, color: "from-purple-500/20 to-purple-500/0", border: "hover:border-purple-500/50" }
              ].map((subject, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className={`amazing-card !p-4 md:!p-6 border-2 border-transparent transition-all cursor-pointer relative overflow-hidden group ${subject.border}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative z-10 space-y-3 md:space-y-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 group-hover:bg-white transition-colors shadow-sm">
                      <subject.icon size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                      <h3 className="text-base md:text-xl font-bold">{subject.name}</h3>
                      <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subject.count}</p>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-brand-primary font-bold text-[10px] md:text-xs">
                      Explore Topics <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: INTERACTIVE DEMO */}
        <section id="demo" className="py-8 md:py-16 relative overflow-hidden bg-white">
          {/* Soft Background Accents */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(5,150,105,0.05),transparent_70%)]" />

          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4 text-left lg:text-left">
                <div className="eyebrow-amazing !py-1 !px-3 !text-[10px]">Interactive Demo</div>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight text-gradient">Experience the <br /> <span className="text-brand-primary">Clean Interface</span></h2>
                <p className="text-base text-slate-500 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                  We stripped away the clutter. Focus entirely on the question, get the answer, and read the explanation.
                </p>
              </div>

              <div className="amazing-card !bg-white !p-6 md:!p-10 shadow-[0_20px_80px_rgba(5,150,105,0.1)] border-2 border-emerald-50">
                <AnimatePresence mode="wait">
                  {demoStep === 0 ? (
                    <motion.div
                      key="q"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Biology • Cell Structure</div>
                        <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-brand-primary" />
                        </div>
                      </div>
                      <h4 className="text-lg md:text-xl font-bold leading-tight text-slate-900">{mcqData.question}</h4>
                      <div className="grid gap-2">
                        {mcqData.options.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => handleAnswer(opt.id)}
                            className="bg-slate-50 border-2 border-slate-100 p-3 rounded-lg flex items-center gap-3 hover:border-brand-primary hover:bg-emerald-50 transition-all text-left group"
                          >
                            <span className="w-7 h-7 rounded-md bg-white flex items-center justify-center font-bold shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-colors text-xs">{opt.id}</span>
                            <span className="font-bold text-slate-700 text-[13px]">{opt.text}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="r"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        {selectedOption === mcqData.correctId ? (
                          <div className="flex items-center gap-3 text-brand-primary font-bold text-lg italic tracking-tighter">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner">
                              <CheckCircle2 size={18} />
                            </div>
                            Brilliant!
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-red-500 font-bold text-lg italic tracking-tighter">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shadow-inner">
                              <XCircle size={18} />
                            </div>
                            Not quite.
                          </div>
                        )}
                      </div>

                      <div className="p-5 bg-slate-50 rounded-xl space-y-3 border border-slate-100 border-l-4 border-l-brand-primary">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Clinical Explanation</div>
                        <p className="text-slate-600 font-bold text-sm leading-relaxed">{mcqData.explanation}</p>
                      </div>

                      <button
                        onClick={() => { setDemoStep(0); setSelectedOption(null); }}
                        className="btn-amazing-outline !py-2.5 w-full !text-sm"
                      >
                        Try Next Question
                        <ChevronRight size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: FINAL CTA (PREMIUM LIGHT) */}
        <section className="py-10 md:py-20 bg-white relative overflow-hidden">
          {/* Mesh Gradient Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-brand-primary/10 via-brand-secondary/5 to-transparent rounded-full blur-[120px] -z-0" />

          <div className="container relative z-10">
            <div className="amazing-card !bg-white/80 !backdrop-blur-3xl !p-6 md:!p-24 text-center border-2 border-slate-100 shadow-[0_50px_100px_rgba(0,0,0,0.05)] rounded-[2.5rem] md:rounded-[4rem] max-w-5xl mx-auto overflow-hidden">
              <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
                <div className="eyebrow-amazing mx-auto italic">Limited Beta Early Access</div>
                <h2 className="text-3xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-gradient">Your future in white coat <br className="hidden md:block" /> starts here.</h2>
                <p className="text-lg md:text-xl text-slate-500 font-medium">
                  Join the most advanced medical test preparation platform in Pakistan. <br className="hidden md:block" /> Secure early access as a founding beta member.
                </p>

                <div className="flex flex-col items-center gap-6 pt-4">
                  <Link href="/register" className="btn-amazing !px-8 !py-4 md:!px-12 md:!py-6 text-lg md:text-xl !rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(5,150,105,0.4)]">
                    Register
                  </Link>
                  <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] shadow-sm shadow-black/5">👨‍⚕️</div>)}
                    </div>
                    Join 10,000+ Await list
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* PREMIUM FOOTER */}
      <footer className="pt-16 md:pt-32 pb-12 bg-slate-50 relative overflow-hidden border-t border-slate-200">
        {/* Subtle decorative glow */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[150px] -z-0" />

        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
            {/* Brand Column */}
            <div className="space-y-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-all">P</div>
                <span className="text-3xl font-bold tracking-tighter text-slate-900">PrepBuddy</span>
              </Link>
              <p className="text-slate-500 font-medium leading-relaxed">
                Empowering the next generation of Pakistani medical students with structured practice and data-driven insights.
              </p>
              <div className="flex gap-3">
                {[Globe, MessageSquare, Smartphone, Award].map((Icon, i) => (
                  <Link key={i} href="#" className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-primary hover:bg-emerald-50 transition-all shadow-sm border border-slate-100">
                    <Icon size={16} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources Column */}
            <div className="space-y-8">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Study Materials</h4>
              <ul className="space-y-4">
                {["MCQs Bank", "Past Papers", "Subject Wisdom", "Formula Sheets", "Latest Syllabus"].map(link => (
                  <li key={link}>
                    <Link href="#" className="text-slate-500 hover:text-brand-primary font-bold transition-colors text-sm">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform Column */}
            <div className="space-y-8">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Platform</h4>
              <ul className="space-y-4">
                {["Mastery Dashboard", "Performance Tracking", "Pricing Plans", "Beta Access", "Future Docs"].map(link => (
                  <li key={link}>
                    <Link href="#" className="text-slate-500 hover:text-brand-primary font-bold transition-colors text-sm">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* PrepBuddy Exclusive Column */}
            <div className="space-y-8">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Beta Program</h4>
              <div className="amazing-card !p-6 !bg-brand-primary/5 !border-brand-primary/10 !rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-brand-primary font-bold italic text-xs tracking-tighter">
                  <Sparkles size={14} className="animate-pulse" /> FOUNDING STUDENT
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  Join 500+ medical aspirants helping us build the smartest preparation hub in Pakistan.
                </p>
                <Link href="/register" className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:underline block">
                  Join The Waitlist →
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col items-center justify-center gap-6 text-center">
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              <Link href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-brand-primary transition-colors">Terms of Service</Link>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Copyright © 2026 PrepBuddy All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

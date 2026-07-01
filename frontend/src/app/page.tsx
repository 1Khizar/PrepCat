"use client";
import AnimatedMCQMockup from "@/components/AnimatedMCQMockup";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronDown,
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
  MessageSquare,
  Bot,
  Flame,
  BookOpen,
  TrendingUp,
  Bookmark
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const [demoStep, setDemoStep] = useState(0); // 0: Question, 1: Result
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [aiTutorStage, setAiTutorStage] = useState<"typing-question" | "promoting-question" | "thinking" | "typing-answer" | "pausing">("typing-question");
  const [aiTutorIndex, setAiTutorIndex] = useState(0);
  const [aiTutorQuestion, setAiTutorQuestion] = useState("");
  const [aiTutorAnswerText, setAiTutorAnswerText] = useState("");
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

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

  const aiTutorThreads = [
    {
      question: "What is the role of ATP in muscle contraction?",
      answer: [
        "ATP powers the myosin cross-bridge cycle in three ways:",
        "1. It energizes the myosin head so it can bind actin.",
        "2. It detaches myosin after the power stroke.",
        "3. It helps relax the muscle by pumping Ca²⁺ back into the SR.",
        "📌 MDCAT Tip: Without ATP, muscles stay locked. That is rigor mortis."
      ].join("\n")
    },
    {
      question: "Why is the rough ER important in cells?",
      answer: [
        "The rough ER is studded with ribosomes and makes proteins for export.",
        "1. It helps fold and transport newly made proteins.",
        "2. It is abundant in secretory cells like pancreas cells.",
        "📌 MDCAT Tip: Rough ER = protein factory for secretion."
      ].join("\n")
    },
    {
      question: "How does osmosis move water in a cell?",
      answer: [
        "Osmosis is the movement of water across a selectively permeable membrane.",
        "1. Water moves from dilute solution to concentrated solution.",
        "2. It continues until both sides are balanced.",
        "📌 MDCAT Tip: Water follows the solute gradient."
      ].join("\n")
    },
    {
      question: "What is the function of hemoglobin?",
      answer: [
        "Hemoglobin transports oxygen from the lungs to body tissues.",
        "1. Each molecule can carry four oxygen molecules.",
        "2. It also helps carry a small amount of carbon dioxide.",
        "📌 MDCAT Tip: Hemoglobin = oxygen transport protein in RBCs."
      ].join("\n")
    },
    {
      question: "Why do enzymes speed up reactions?",
      answer: [
        "Enzymes speed up reactions by lowering activation energy.",
        "1. They make the reaction easier to start.",
        "2. They are not used up in the reaction.",
        "📌 MDCAT Tip: Enzymes are biological catalysts."
      ].join("\n")
    }
  ];

  const currentAiTutorThread = aiTutorThreads[aiTutorIndex];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (aiTutorStage === "typing-question") {
      setAiTutorQuestion("");
      setAiTutorAnswerText("");

      const typeQuestion = (index: number) => {
        setAiTutorQuestion(currentAiTutorThread.question.slice(0, index));

        if (index < currentAiTutorThread.question.length) {
          timers.push(setTimeout(() => typeQuestion(index + 1), 28));
          return;
        }

        timers.push(setTimeout(() => setAiTutorStage("promoting-question"), 250));
      };

      timers.push(setTimeout(() => typeQuestion(1), 220));
    } else if (aiTutorStage === "promoting-question") {
      timers.push(setTimeout(() => setAiTutorStage("thinking"), 550));
    } else if (aiTutorStage === "thinking") {
      timers.push(setTimeout(() => setAiTutorStage("typing-answer"), 700));
    } else if (aiTutorStage === "typing-answer") {
      const typeAnswer = (index: number) => {
        setAiTutorAnswerText(currentAiTutorThread.answer.slice(0, index));

        if (index < currentAiTutorThread.answer.length) {
          timers.push(setTimeout(() => typeAnswer(index + 1), 18));
          return;
        }

        timers.push(setTimeout(() => setAiTutorStage("pausing"), 2200));
      };

      timers.push(setTimeout(() => typeAnswer(1), 180));
    } else {
      timers.push(setTimeout(() => {
        setAiTutorIndex((value) => (value + 1) % aiTutorThreads.length);
        setAiTutorStage("typing-question");
      }, 900));
    }

    return () => timers.forEach(clearTimeout);
  }, [aiTutorStage, aiTutorIndex]);

  const handleAnswer = (id: string) => {
    setSelectedOption(id);
    setDemoStep(1);
  };

  return (
    <div className="min-h-screen bg-mesh selection:bg-brand-primary/20 overflow-x-hidden">
      <Navbar />

      <main>
        {/* SECTION 1: ENGAGING SPLIT HERO */}
        <section className="relative overflow-hidden bg-slate-50 pt-20 lg:pt-24 pb-10 lg:pb-16 flex items-center min-h-[85vh]">
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(37,99,235,0.04)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(29,78,216,0.04)_0%,transparent_50%)]"></div>
          
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              
              {/* Main Copy & CTAs */}
              <div className="flex flex-col items-start text-left space-y-8 max-w-2xl">
                {/* Eyebrow badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-[2px] bg-blue-600"></div>
                  <span className="text-[13px] font-black uppercase tracking-[0.15em] text-blue-600">
                    MDCAT & NUMS PAST PAPERS + AI TUTOR
                  </span>
                </motion.div>

                {/* Main heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  style={{ fontFamily: 'var(--font-bricolage)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em' }}
                  className="text-[3.5rem] sm:text-[4rem] lg:text-[4.5rem] text-slate-900"
                >
                  Study Smarter.<br/>
                  <span className="italic text-blue-600">
                    Score Higher.
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-lg"
                >
                  Practice real past papers from MDCAT & NUMS. Get instant answers from your AI Tutor whenever you're stuck.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-start"
                >
                  <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 hover:-translate-y-0.5">
                    Create Account
                  </Link>
                  <Link href="/login" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-10 py-3.5 rounded-2xl font-bold text-base transition-all shadow-sm flex items-center justify-center gap-2 hover:-translate-y-0.5">
                    Login
                  </Link>
                </motion.div>
              </div>

              {/* Animated Mockup on the Right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-full flex items-center justify-center lg:justify-end"
              >
                <div className="w-full scale-90 sm:scale-95 lg:scale-90 origin-center lg:origin-right max-w-[600px]">
                  <AnimatedMCQMockup />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        {/* SECTION 2: CORE FEATURES GRID */}
        <section id="features" className="py-6 md:py-10 relative bg-white border-y border-slate-100">
          <div className="container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { title: "Past Papers", subtitle: "MDCAT & NUMS", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50/80" },
                { title: "AI Tutor", subtitle: "Instant Answers", icon: Bot, color: "text-indigo-600", bg: "bg-indigo-50/80" },
                { title: "Daily Streak", subtitle: "Build Habits", icon: Flame, color: "text-orange-500", bg: "bg-orange-50/80" },
                { title: "My Progress", subtitle: "Track Growth", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50/80" }
              ].map((stat, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  key={i}
                  className="bg-white p-6 md:p-8 rounded-[1.75rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-center flex flex-col items-center hover:-translate-y-1.5 transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group"
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 ${stat.bg} ${stat.color} rounded-2xl md:rounded-3xl flex items-center justify-center mb-5 md:mb-6 group-hover:scale-105 transition-transform duration-300`}>
                    <stat.icon size={26} strokeWidth={2} />
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-1.5 tracking-tight">{stat.title}</h3>
                  <p className="text-[13px] md:text-[14px] font-semibold text-slate-500">{stat.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: THE PREPARATION GAP (STRATEGY) */}
        <section id="why-us" className="py-10 md:py-12 bg-slate-50 relative">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 lg:pl-10">
                <div className="eyebrow-amazing">Why PrepCat?</div>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight text-gradient">
                  Academies are expensive. <br />
                  <span className="text-blue-600">PrepCat is smart.</span>
                </h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                  Most students fail not because they don't study, but because they study unorganized content. PrepCat gives you the structure of an elite academy for free.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  {[
                    "Organized Content",
                    "Expert Explanations",
                    "Real-time Tracking",
                    "Daily Rank Analysis"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex justify-center lg:justify-end">
                <div className="amazing-card !p-6 md:!p-8 relative overflow-hidden group border-2 border-brand-primary/10 max-w-lg lg:max-w-md">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full" />

                  <div className="space-y-6 relative z-10">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-3 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                        <XCircle size={14} /> The Old Way
                      </div>
                      <p className="text-slate-500 font-medium text-[15px] leading-relaxed">
                        <span className="line-through decoration-slate-300">Expensive academies, heavy bags, and random PDFs with no proper keys.</span>
                      </p>
                    </div>

                    <div className="p-6 bg-blue-50/80 rounded-2xl border border-blue-100 shadow-[0_8px_30px_rgb(37,99,235,0.04)]">
                      <div className="flex items-center gap-2 mb-3 text-blue-600 font-bold text-[11px] uppercase tracking-widest">
                        <Sparkles size={14} /> The PrepCat Way
                      </div>
                      <p className="text-blue-950 font-semibold text-[17px] leading-snug">
                        "All your preparation, tracked, analyzed, and perfected in one tiny browser tab."
                      </p>
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
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need to <span className="text-blue-600">Succeed.</span></h2>
              <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                Carefully curated questions for every subject, mapped exactly to the latest UHS and PMDC syllabus.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { name: "Biology", count: "8,500+ MCQs", icon: Brain, color: "from-blue-500/20 to-blue-500/0", border: "hover:border-blue-500/50" },
                { name: "Chemistry", count: "6,200+ MCQs", icon: Sparkles, color: "from-blue-600/20 to-blue-600/0", border: "hover:border-blue-600/50" },
                { name: "Physics", count: "4,800+ MCQs", icon: Zap, color: "from-blue-400/20 to-blue-400/0", border: "hover:border-blue-400/50" },
                { name: "English", count: "1,500+ MCQs", icon: FileText, color: "from-blue-700/20 to-blue-700/0", border: "hover:border-blue-700/50" }
              ].map((subject, i) => (
                <Link href="/register" key={i}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className={`amazing-card !p-4 md:!p-6 border-2 border-transparent transition-all cursor-pointer relative overflow-hidden group ${subject.border} h-full`}
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
                      <div className="flex items-center gap-1 md:gap-2 text-blue-600 font-bold text-[10px] md:text-xs">
                        Explore Topics <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5B: AI TUTOR SHOWCASE */}
        <section id="ai-tutor" className="py-16 md:py-24 relative bg-slate-50 text-slate-900 overflow-hidden">
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.05),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.05),transparent_60%)]" />

          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left: Copy */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-blue-600 rounded-full"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600">PrepCat AI Tutor</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                  Your personal <span className="text-blue-600">MDCAT guide.</span>
                </h2>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                  Ask anything — Biology, Chemistry, Physics, or English. PrepCat AI searches the web and gives you clear, instant answers to help you prepare for MDCAT.
                </p>

                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-blue-600 flex-shrink-0" />
                    <span className="font-bold text-slate-600 text-sm">Searches the web in real-time for the most accurate answers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-blue-600 flex-shrink-0" />
                    <span className="font-bold text-slate-600 text-sm">Available 24/7 — get help whenever you need it</span>
                  </div>
                </div>

                <Link href="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-xl transition-all text-sm shadow-sm">
                  Try AI Tutor Free <ChevronRight size={16} />
                </Link>
              </div>

              {/* Right: Chat UI mockup */}
              <div className="relative">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">PrepCat AI Tutor</p>
                        <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                          Online and answering perfectly
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                      Live demo
                    </span>
                  </div>

                  <div className="p-5 space-y-4 bg-gradient-to-b from-white via-blue-50/30 to-white">
                      <div className="flex justify-end">
                        {aiTutorStage !== "typing-question" ? (
                          <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.35 }}
                            className="max-w-[88%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-sm font-semibold leading-relaxed text-white shadow-sm"
                          >
                            <span>{currentAiTutorThread.question}</span>
                          </motion.div>
                        ) : null}
                      </div>

                      <div className="flex gap-3 items-start">
                        <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50">
                          <Bot size={14} className="text-blue-600" />
                        </div>

                        <div className="min-h-[190px] flex-1">
                          <AnimatePresence mode="wait">
                            {aiTutorStage === 1 ? (
                              <motion.div
                                key="thinking"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-4 shadow-sm"
                              >
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                  Thinking
                                  <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.2s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.1s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                                  </span>
                                </div>
                              </motion.div>
                            ) : null}

                            {aiTutorStage === "typing-answer" || aiTutorStage === "pausing" ? (
                              <motion.div
                                key="answer"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="rounded-2xl rounded-tl-sm border border-blue-100 bg-blue-50/70 px-4 py-4 shadow-sm"
                              >
                                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-medium font-sans">{aiTutorAnswerText}</pre>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      </div>
                  </div>

                  {/* Search Bar / Input Mockup */}
                  <div className="border-t border-slate-100 bg-white p-4">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <div className="text-slate-400 text-sm flex-1 truncate">
                        {aiTutorStage === "typing-question" ? (
                          <>
                            <span className="text-slate-800">{aiTutorQuestion}</span>
                            <span className="inline-block w-0.5 h-4 ml-1 align-middle bg-blue-600 animate-pulse"></span>
                          </>
                        ) : (
                          "Ask a question..."
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

        {/* SECTION 7: FAQ */}
        <section id="faq" className="py-16 md:py-24 bg-slate-50 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          <div className="container relative z-10">
            <div className="text-center mb-12">
              <div className="eyebrow-amazing">FAQs</div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">Frequently asked questions</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">Everything you need to know about preparing for MDCAT & NUMS with PrepCat.</p>
            </div>

            <div className="max-w-3xl mx-auto flex flex-col gap-4">
              {[
                { q: "How does the AI Tutor work?", a: "When you are stuck on a question, simply click 'Ask AI Tutor'. Our advanced AI, trained specifically on the medical entrance exam syllabus (Biology, Chemistry, Physics, English), will break down the exact reasoning behind the correct answer step-by-step." },
                { q: "Is PrepCat completely free to use?", a: "PrepCat offers a generous free tier that includes access to a vast library of past papers. For advanced features like unlimited AI Tutor explanations and deep progress analytics, you can upgrade to our Premium plan." },
                { q: "How does progress tracking help me score higher?", a: "Our dashboard lets you monitor your daily streaks and track your study habits. Building a daily learning habit and seeing your streak grow is one of the most effective ways to stay motivated during your prep." }
              ].map((faq, i) => (
                <div key={i} className={`bg-white rounded-[1.25rem] border transition-all duration-300 overflow-hidden ${faqOpenIndex === i ? 'border-blue-200 shadow-md' : 'border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-blue-100'}`}>
                  <button 
                    onClick={() => setFaqOpenIndex(faqOpenIndex === i ? null : i)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center transition-colors focus:outline-none group"
                  >
                    <span className={`font-bold text-lg pr-8 transition-colors ${faqOpenIndex === i ? 'text-blue-900' : 'text-slate-900 group-hover:text-blue-600'}`}>{faq.q}</span>
                    <div className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center transition-colors duration-300 ${faqOpenIndex === i ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                      <ChevronDown size={20} className={`transition-transform duration-300 ${faqOpenIndex === i ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {faqOpenIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-1 text-slate-500 leading-relaxed font-medium text-[15px]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
    </div>
  );
}

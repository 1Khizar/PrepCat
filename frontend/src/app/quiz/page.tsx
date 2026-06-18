"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  X, ChevronLeft, ChevronRight, 
  Flag, BookMarked, HelpCircle,
  Trophy, Clock, Check,
  LayoutDashboard, FileText,
  BookOpen
} from "lucide-react";

export default function QuizPage() {
  const [currentQ, setCurrentQ] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const options = [
    { text: "Option A: Rough Endoplasmic Reticulum" },
    { text: "Option B: Smooth Endoplasmic Reticulum", correct: true },
    { text: "Option C: Golgi Apparatus" },
    { text: "Option D: Lysosomes" },
  ];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center text-white font-black">P</div>
            <span className="text-xl font-black">Prep<span className="text-brand-teal">Buddy</span></span>
          </Link>

          <nav className="space-y-1">
            <Link href="/profile" className="sidebar-link"><LayoutDashboard size={20} /> Dashboard</Link>
            <Link href="/quiz" className="sidebar-link-active"><FileText size={20} /> Question Bank</Link>
            <Link href="#" className="sidebar-link"><BookOpen size={20} /> Past Papers</Link>
            <Link href="#" className="sidebar-link"><Trophy size={20} /> Leaderboard</Link>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-6">
            <Link href="/profile" className="text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </Link>
            <div>
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Biology • Cell Structure</div>
              <div className="text-sm font-bold text-slate-900 truncate max-w-[200px] md:max-w-none">MDCAT Full Length Practice</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <Clock size={18} className="text-blue-600" />
            <span className="text-lg font-black tabular-nums tracking-tighter text-slate-800">12:45</span>
          </div>
        </header>

        <div className="p-6 md:p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Question Progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question</span>
                <span className="text-4xl font-black text-brand-navy">{currentQ}</span>
                <span className="text-xl font-black text-slate-300">/ 50</span>
              </div>
              <div className="flex gap-4">
                <button className="p-3 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                  <Flag size={20} />
                </button>
                <button className="p-3 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                  <BookMarked size={20} />
                </button>
              </div>
            </div>

            {/* Question Card */}
            <motion.div 
              key={currentQ}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-premium p-10 md:p-16 min-h-[400px] flex flex-col justify-center border-slate-200"
            >
              <h2 className="text-2xl md:text-4xl font-black leading-tight mb-16 text-slate-800">
                Which organelle is responsible for synthesizing lipids and detoxifying drugs in animal cells?
              </h2>

              <div className="grid gap-4">
                {options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  const isCorrect = opt.correct;
                  const showCorrect = showExplanation && isCorrect;
                  const showIncorrect = showExplanation && isSelected && !isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left py-5 px-6 rounded-2xl border transition-all flex items-center justify-between ${
                        showCorrect ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold" : 
                        showIncorrect ? "border-slate-400 bg-slate-100 text-slate-700 font-bold" : 
                        isSelected ? "border-blue-600 bg-blue-50/30 text-slate-900" : "border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50/20"
                      }`}
                    >
                      <span className="text-lg font-bold">{opt.text}</span>
                      {showCorrect && <Check size={20} className="text-blue-600" />}
                      {showIncorrect && <X size={20} className="text-slate-500" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Explanation Area */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-100 p-8 rounded-2xl flex flex-col md:flex-row gap-6 items-start"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-700 mb-3">Expert Explanation</h4>
                    <p className="text-base text-blue-800 leading-relaxed font-bold">
                      The smooth endoplasmic reticulum (SER) is the site for lipid synthesis and drug detoxification. It is distinct from the Rough ER because it lacks ribosomes on its surface.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-8 pt-10 border-t border-slate-200">
              <button className="flex items-center gap-3 font-black text-slate-400 hover:text-brand-navy transition-colors uppercase tracking-widest text-xs">
                <ChevronLeft size={20} />
                Previous Question
              </button>
              <button 
                onClick={() => {
                  setCurrentQ(currentQ + 1);
                  setSelected(null);
                  setShowExplanation(false);
                }}
                className="btn-accent py-4 px-12 group flex items-center gap-4 text-base"
              >
                Next Challenge
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

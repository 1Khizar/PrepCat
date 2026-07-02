"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, FileText } from "lucide-react";

const mcqs = [
  {
    exam: "MDCAT 2023",
    subject: "Biology",
    questionNum: "18 / 200",
    question: "Which of the following hormones is primarily secreted by the corpus luteum during the menstrual cycle?",
    options: [
      { letter: "A", text: "Estrogen" },
      { letter: "B", text: "Progesterone", isCorrect: true },
      { letter: "C", text: "Luteinizing Hormone (LH)" },
      { letter: "D", text: "Follicle Stimulating Hormone (FSH)" },
    ],
    explanation: "Correct! The corpus luteum secretes progesterone to maintain the endometrial lining of the uterus for potential pregnancy.",
  },
  {
    exam: "MDCAT 2024",
    subject: "Physics",
    questionNum: "85 / 200",
    question: "What is the SI unit of magnetic flux?",
    options: [
      { letter: "A", text: "Tesla" },
      { letter: "B", text: "Weber", isCorrect: true },
      { letter: "C", text: "Gauss" },
      { letter: "D", text: "Henry" },
    ],
    explanation: "Correct! The SI unit of magnetic flux is the Weber (Wb), whereas Tesla (T) is the unit of magnetic field strength.",
  },
  {
    exam: "NUMS 2023",
    subject: "Chemistry",
    questionNum: "132 / 150",
    question: "Which of the following hydrides has the highest boiling point?",
    options: [
      { letter: "A", text: "H2S" },
      { letter: "B", text: "H2Se" },
      { letter: "C", text: "H2Te" },
      { letter: "D", text: "H2O", isCorrect: true },
    ],
    explanation: "Correct! H2O has the highest boiling point among group 16 hydrides due to strong intermolecular hydrogen bonding.",
  },
  {
    exam: "MDCAT 2022",
    subject: "English",
    questionNum: "192 / 200",
    question: "Choose the correct preposition: He deals ___ imported garments.",
    options: [
      { letter: "A", text: "in", isCorrect: true },
      { letter: "B", text: "with" },
      { letter: "C", text: "at" },
      { letter: "D", text: "for" },
    ],
    explanation: "Correct! 'Deal in' means to trade or do business in a particular commodity, whereas 'deal with' refers to handling a situation or person.",
  }
];

export default function AnimatedMCQMockup() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mcqs.length);
    }, 4500); // Change every 4.5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto drop-shadow-2xl">
      {/* Browser Frame */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        {/* Browser Top Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          <div className="bg-white border border-slate-200 rounded-md px-4 py-1.5 text-xs text-slate-400 font-medium flex-1 text-left">
            prepcat.app/practice
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 bg-white relative h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 p-5 flex flex-col"
            >
              {/* Exam Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                    <FileText size={16} />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    {mcqs[currentIndex].exam} — <span className="font-semibold text-slate-600">{mcqs[currentIndex].subject}</span>
                  </h3>
                </div>
                <div className="border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-slate-500">
                  Q {mcqs[currentIndex].questionNum}
                </div>
              </div>

              {/* Question Card */}
              <div className="border border-slate-100 shadow-sm rounded-xl p-4 flex-1 flex flex-col">
                <p className="text-slate-800 font-bold text-sm leading-relaxed mb-4">
                  {mcqs[currentIndex].question}
                </p>

                {/* Options */}
                <div className="flex flex-col gap-2">
                  {mcqs[currentIndex].options.map((opt, i) => (
                    <motion.div
                      key={i}
                      initial={opt.isCorrect ? { backgroundColor: "#ffffff", color: "#334155", borderColor: "#e2e8f0" } : {}}
                      animate={opt.isCorrect ? { backgroundColor: "#2563EB", color: "#ffffff", borderColor: "#2563EB" } : {}}
                      transition={{ delay: 1.5, duration: 0.4 }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
                        !opt.isCorrect ? "border-slate-200 bg-white text-slate-700" : ""
                      }`}
                    >
                      <motion.div 
                        initial={opt.isCorrect ? { backgroundColor: "#f1f5f9", color: "#64748b" } : {}}
                        animate={opt.isCorrect ? { backgroundColor: "#ffffff", color: "#2563EB" } : {}}
                        transition={{ delay: 1.5, duration: 0.4 }}
                        className={`w-7 h-7 flex items-center justify-center rounded bg-slate-100 text-slate-500 font-bold text-xs ${!opt.isCorrect ? "" : ""}`}
                      >
                        {opt.letter}
                      </motion.div>
                      <span className="font-medium text-sm">{opt.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Explanation (Fades in) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.5 }}
                className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2"
              >
                <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  {mcqs[currentIndex].explanation}
                </p>
              </motion.div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

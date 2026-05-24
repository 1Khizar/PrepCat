"use client";

import { motion } from "framer-motion";
import { Dna, Beaker, Zap, BookOpen, ArrowRight, Star, Heart, Compass } from "lucide-react";
import Link from "next/link";

const subjects = [
  {
    name: "Biology",
    icon: Dna,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    accent: "bg-emerald-500",
    description: "Learn about life! Everything from cells to humans, perfectly organized for your MDCAT.",
    count: "24,000+ Questions",
  },
  {
    name: "Physics",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-50",
    accent: "bg-amber-500",
    description: "Make physics fun with easy-to-follow past paper solutions and numerical practice.",
    count: "18,000+ Questions",
  },
  {
    name: "Chemistry",
    icon: Beaker,
    color: "text-blue-500",
    bg: "bg-blue-50",
    accent: "bg-blue-500",
    description: "Master all types of chemistry with official papers and simple explanations.",
    count: "21,000+ Questions",
  },
  {
    name: "English",
    icon: BookOpen,
    color: "text-purple-500",
    bg: "bg-purple-50",
    accent: "bg-purple-500",
    description: "Build your vocabulary and ace the grammar section with our curated sets.",
    count: "8,000+ Questions",
  },
];

const SubjectPreview = () => {
  return (
    <section id="subjects" className="py-24 bg-white relative">
      <div className="container items-center text-center">
        <div className="max-w-2xl mx-auto space-y-6 mb-20">
          <div className="eyebrow mx-auto uppercase">Study Smarter</div>
          <h2 className="text-4xl md:text-5xl font-black text-text-navy">
            Choose Your <span className="text-brand-primary">Favorite</span> Subject
          </h2>
          <p className="text-lg text-text-muted font-bold">
            We've organized every past paper so you can focus on what matters most—your learning journey!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {subjects.map((sub, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`group p-10 rounded-[3rem] ${sub.bg} border-2 border-transparent hover:border-white hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center`}
            >
              <div className={`w-20 h-20 rounded-[2rem] bg-white shadow-sm flex items-center justify-center ${sub.color} mb-8 group-hover:rotate-6 transition-transform duration-500`}>
                <sub.icon size={32} />
              </div>

              <h3 className="text-2xl font-black text-text-navy mb-4">{sub.name}</h3>
              <p className="text-sm font-bold text-text-muted leading-relaxed mb-8">
                {sub.description}
              </p>

              <div className="mt-auto w-full">
                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">
                  {sub.count}
                </div>
                <Link
                  href="/register"
                  className={`w-full py-4 rounded-2xl ${sub.accent} text-white font-black flex items-center justify-center gap-2 group-hover:scale-105 transition-all shadow-lg shadow-black/5`}
                >
                  Start Practice
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fun Trust Bar */}
        <div className="mt-24 p-12 bg-buddy-gradient rounded-[3.5rem] border-2 border-slate-50 flex flex-wrap justify-between items-center gap-10">
          <div className="flex flex-col items-center gap-4 flex-1">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm">
              <Star size={24} fill="currentColor" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-text-navy">4.9/5</div>
              <div className="text-xs font-bold text-text-muted">Student Rating</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 flex-1">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-secondary shadow-sm">
              <Heart size={24} fill="currentColor" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-text-navy">95% Success</div>
              <div className="text-xs font-bold text-text-muted">Our Goal</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 flex-1">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-accent shadow-sm">
              <Compass size={24} />
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-text-navy">Official</div>
              <div className="text-xs font-bold text-text-muted">Paper Sources</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubjectPreview;

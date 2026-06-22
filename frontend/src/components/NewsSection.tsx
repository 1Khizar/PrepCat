"use client";

import { motion } from "framer-motion";
import { Bell, ArrowRight, Calendar } from "lucide-react";

const NewsSection = () => {
  const news = [
    {
      title: "UHS 2025 Syllabus Confirmed by Authorities",
      date: "April 15, 2026",
      category: "Exam Update",
    },
    {
      title: "NUMS Registration Window Now Open",
      date: "April 12, 2026",
      category: "Registration",
    },
    {
      title: "Public Medical Colleges Fee Policy Revised",
      date: "April 10, 2026",
      category: "Policy",
    },
  ];

  return (
    <section className="section-padding bg-slate-50 relative border-t border-slate-100">
      <div className="container">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-xl">
            <div className="eyebrow">Latest Updates</div>
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-slate-900">MDCAT News</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Stay informed about the latest policy changes and registration dates.
            </p>
          </div>
          <button className="flex items-center gap-3 font-black text-blue-600 group text-[11px] uppercase tracking-widest pb-2">
            Archive News
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {news.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="card-premium hover:border-blue-600/30 group flex flex-col h-full bg-white transition-all overflow-hidden"
            >
              <div className="p-10 pb-0">
                <div className="flex items-center gap-4 mb-8">
                  <span className="px-3 py-1 bg-blue-600/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-600/10">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar size={14} />
                    {item.date}
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-10 text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {item.title}
                </h3>
              </div>
              <div className="mt-auto p-10 pt-0 flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest">Read More</span>
                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 transition-all">
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Breaking News Banner - Clean Style */}
        <div className="mt-20 p-6 bg-white border border-slate-200 border-l-4 border-l-blue-600 rounded-xl shadow-sm overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-blue-600 text-white px-4 py-1.5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shrink-0 rounded-md">
              <Bell size={14} className="animate-pulse" />
              Breaking Alert
            </div>
            <div className="font-bold text-sm tracking-tight text-slate-700 flex-1 text-center md:text-left leading-relaxed">
              PMC 2025 Notice: MDCAT to be held simultaneously across all provinces. Check revised dates.
            </div>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 underline decoration-2 underline-offset-4">Details</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;

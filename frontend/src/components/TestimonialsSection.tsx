"use client";

import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2 } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Ahmed Raza",
    university: "King Edward Medical University",
    score: "192/200",
    text: "The precision of the past paper engine is unparalleled. Decoding 10 years of organic chemistry trends was the key to my merit position at KEMU.",
    avatar: "AR",
  },
  {
    name: "Dr. Sana Malik",
    university: "Allama Iqbal Medical College",
    score: "188/200",
    text: "PrepCat didn't just give me papers; it gave me a professional ecosystem. The subject-wise categorization is the most strategic resource I've used.",
    avatar: "SM",
  },
  {
    name: "Dr. Bilal Khan",
    university: "Aga Khan University (AKU)",
    score: "95th Percentile",
    text: "Strategic excellence is required for top medical seats. This vault provides the verbatim official exam difficulty that textbooks simply cannot replicate.",
    avatar: "BK",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-32 bg-white relative">
      <div className="container">
        <div className="text-center mb-24 max-w-3xl mx-auto space-y-4">
          <div className="eyebrow mx-auto">Vanguard of Success</div>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">Voices of Success</h2>
          <p className="text-xl text-slate-500 font-medium">
            Join the students who refused to settle for mediocrity. Our alumni now occupy the most prestigious medical seats in Pakistan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-12 border border-slate-100 rounded-[3.5rem] bg-slate-50/30 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.08)] transition-all flex flex-col items-start text-left group"
            >
              <div className="flex justify-between w-full mb-10">
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-blue-600 text-blue-600" />
                  ))}
                </div>
                <CheckCircle2 size={18} className="text-blue-600 opacity-50" />
              </div>

              <p className="text-xl font-bold text-slate-800 leading-relaxed mb-12 italic tracking-tight">
                "{t.text}"
              </p>

              <div className="flex items-center gap-5 mt-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-slate-900/10 group-hover:bg-blue-600 transition-colors">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-black text-slate-900 text-base">{t.name}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-600 mt-0.5">
                    {t.university}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest bg-white border border-slate-100 px-2 py-0.5 rounded-full inline-block">
                    Score: {t.score}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

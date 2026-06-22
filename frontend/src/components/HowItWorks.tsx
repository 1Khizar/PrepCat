"use client";

import { motion } from "framer-motion";
import { UserPlus, BookOpen, BarChart3 } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    { title: "Sign Up", desc: "Create your free account in less than 30 seconds.", icon: UserPlus },
    { title: "Select Subject", desc: "Choose from Bio, Chem, Physics, or English banks.", icon: BookOpen },
    { title: "Excel", desc: "Practice daily, review solutions, and track progress.", icon: BarChart3 },
  ];

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="container text-center">
        <div className="eyebrow">The Simple Way</div>
        <h2 className="text-4xl md:text-6xl font-black mb-24 text-slate-900">How to Start</h2>

        <div className="flex flex-col md:flex-row gap-16 lg:gap-32 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="flex-1 flex flex-col items-center group"
            >
              <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center mb-10 relative group-hover:border-blue-600 transition-all group-hover:scale-105 shadow-sm">
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-xl shadow-lg">
                  {idx + 1}
                </div>
                <step.icon size={44} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-900">{step.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

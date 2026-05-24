"use client";

import { motion } from "framer-motion";
import { Users, FileText, Star, Trophy } from "lucide-react";

const stats = [
  { label: "Active Aspirants", value: "25k+", icon: Users },
  { label: "Verified Papers", value: "100+", icon: FileText },
  { label: "Success Rate", value: "98%", icon: Star },
  { label: "Merit Rankers", value: "500+", icon: Trophy },
];

const StatsBar = () => {
  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center lg:items-start space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-teal">
                  <stat.icon size={20} />
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;

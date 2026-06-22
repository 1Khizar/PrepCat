"use client";

import { motion } from "framer-motion";
import { Brain, Flame, Users, LineChart, BookMarked, Layers, ArrowRight } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      title: "Smart Solutions",
      description: "Get detailed, easy-to-understand explanations for every MCQ. No more confusion, just clear concepts.",
      icon: Brain,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Daily Motivation",
      description: "Stay consistent with daily streaks and goal tracking. Build the habit of studying every single day.",
      icon: Flame,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Compete with Friends",
      description: "Join study groups or dynamic challenge rooms to practice together and stay motivated.",
      icon: Users,
      color: "bg-blue-50 text-blue-500",
    },
    {
      title: "Progress Tracking",
      description: "See exactly which chapters you've mastered and where you need more practice with simple heatmaps.",
      icon: LineChart,
      color: "bg-blue-50 text-blue-800",
    },
    {
      title: "MDCAT Past Papers",
      description: "Access every verified UHS and NUMS paper from the last 10 years, all in one place.",
      icon: BookMarked,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Real Exam Experience",
      description: "Practice with full-length mock tests that feel exactly like the real MDCAT exam environment.",
      icon: Layers,
      color: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <section id="features" className="py-32 lg:py-48 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/5 blur-[120px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-500/5 blur-[100px] rounded-full -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="container relative">
        <div className="text-center max-w-3xl mx-auto mb-32 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="eyebrow"
          >
            Key Platform Features
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-black mb-10 text-slate-900 tracking-tight leading-[0.95]"
          >
            Everything you need for <br /><span className="text-blue-600">MDCAT Success</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 leading-relaxed font-medium"
          >
            We focus on what matters: clear explanations, consistent practice, and detailed tracking.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-10 lg:p-12 rounded-[2.5rem] border border-slate-100 shadow-premium group hover:border-blue-600/30 transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`w-16 h-16 rounded-[1.25rem] ${feature.color} flex items-center justify-center mb-10 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon size={32} />
              </div>
              <h3 className="text-2xl font-black mb-6 text-slate-900 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed font-medium text-base mb-8">
                {feature.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:gap-4">
                Learn More <ArrowRight size={16} className="text-blue-600" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

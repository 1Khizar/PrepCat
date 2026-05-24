"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="container relative z-10 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl"
        >
          <div className="eyebrow mb-10 mx-auto">
            <Star size={14} className="fill-brand-gold text-brand-gold" />
            Join 20,000+ Smart Aspirants
          </div>
          <h2 className="text-5xl md:text-8xl font-black mb-10 leading-[1] text-slate-900">
            Secure Your <br /><span className="text-brand-teal">Medical Seat.</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-500 mb-16 font-medium leading-relaxed">
            Start your preparation journey today. No credit card required. 100% Free while in Beta.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
            <button className="btn-accent px-16 py-5 text-xl">
              Create Free Account
              <ArrowRight size={24} />
            </button>
            <div className="text-left">
              <div className="flex items-center gap-1.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Top Rated Study Tool
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

"use client";

import { motion } from "framer-motion";
import { ChevronRight, Heart, Star, Zap, Smile, BookOpen, PartyPopper } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-white bg-buddy-gradient">
      {/* Friendly Background Blobs */}
      <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] bg-brand-primary/5 rounded-full blur-[80px]" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center lg:text-left">
            {/* Friendly Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="eyebrow mx-auto lg:mx-0 inline-flex"
            >
              <PartyPopper size={14} className="text-brand-primary" />
              Your Personal MDCAT Study Buddy is here!
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-text-navy leading-[1.1]"
            >
              Ace the MDCAT with <br />
              <span className="text-brand-secondary underline decoration-brand-accent decoration-4">Confidence.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-text-muted max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
            >
              Don't study harder, study <span className="text-brand-primary font-bold text-2xl">happier!</span> PrepBuddy makes mastering past papers fun, organized, and super easy for every future doctor.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="/register" className="btn-primary py-5 px-10 rounded-3xl w-full sm:w-auto text-base">
                Let's Get Started!
                <ChevronRight size={20} />
              </Link>
              <Link href="/login" className="btn-outline py-5 px-10 rounded-3xl w-full sm:w-auto text-base">
                Open My Vault
              </Link>
            </motion.div>

            {/* Love Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center lg:justify-start gap-6 pt-4"
            >
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 border-4 border-white rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">
                    😊
                  </div>
                ))}
              </div>
              <div className="text-sm font-bold text-text-muted">
                Joined by <span className="text-brand-primary">25,000+</span> happy students!
              </div>
            </motion.div>
          </div>

          {/* Friendly Mascot / Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative lg:block"
          >
            <div className="relative z-10 animate-bop">
              <Image
                src="/friendly_medical_study_companion_1776936698774.png"
                alt="Study Buddy Mascot"
                width={600}
                height={600}
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
            {/* Floating Cards */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-white p-6 rounded-3xl shadow-vibrant border border-brand-primary/10 z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-soft rounded-full flex items-center justify-center text-brand-primary">
                  <Heart size={20} fill="currentColor" />
                </div>
                <div>
                  <div className="text-xs font-black">Success Guaranteed</div>
                  <div className="text-[10px] font-bold text-text-muted">100% Student Approved</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

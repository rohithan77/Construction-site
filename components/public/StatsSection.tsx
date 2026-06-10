"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportConfig } from "@/lib/animations";

interface StatsSectionProps {
  stats?: { years?: string; projects?: string; clients?: string; team?: string };
}

function useCounter(target: number, duration = 2200, enabled = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, enabled]);
  return count;
}

function StatCard({ num, suffix, label, index }: { num: number; suffix: string; label: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const count = useCounter(num, 2200, inView);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="group relative flex flex-col items-center py-14 px-6 text-center cursor-default"
    >
      <div className="flex items-end gap-1 mb-3">
        <span className="font-display font-black text-[clamp(3.5rem,5.5vw,5rem)] leading-none text-white group-hover:text-gold transition-colors duration-500">
          {inView ? count.toLocaleString() : "0"}
        </span>
        <span className="font-display font-black text-3xl text-gold mb-2 leading-none">{suffix}</span>
      </div>
      <span className="text-white/35 text-[11px] uppercase tracking-[0.28em] font-medium">{label}</span>
      <div className="mt-5 h-[2px] w-6 bg-gold/0 group-hover:w-12 group-hover:bg-gold/50 transition-all duration-500 ease-out" />
    </motion.div>
  );
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const items = [
    { num: parseInt(stats?.years ?? "25"), suffix: "+", label: "Years of Experience" },
    { num: parseInt(stats?.projects ?? "500"), suffix: "+", label: "Projects Completed" },
    { num: parseInt(stats?.clients ?? "98"), suffix: "%", label: "Client Satisfaction" },
    { num: parseInt(stats?.team ?? "50"), suffix: "+", label: "Expert Team Members" },
  ];

  return (
    <section className="relative bg-[#0D0D10] border-y border-white/[0.04] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: "radial-gradient(circle, #C9A84C 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.05]"
        >
          {items.map((item, i) => (
            <StatCard key={item.label} {...item} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

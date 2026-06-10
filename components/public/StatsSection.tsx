"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: string;
  label: string;
  description: string;
}

interface StatsSectionProps {
  stats?: {
    years?: string;
    projects?: string;
    clients?: string;
    team?: string;
  };
}

function useCountUp(target: string, duration: number = 2000) {
  const [count, setCount] = useState("0");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const numericTarget = parseInt(target.replace(/\D/g, ""), 10);
    const suffix = target.replace(/[\d]/g, "").trim();
    if (isNaN(numericTarget)) { setCount(target); return; }

    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * numericTarget);
      setCount(`${current}${suffix}`);
      if (progress >= 1) { setCount(target); clearInterval(timer); }
    }, 16);

    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, start: () => setStarted(true) };
}

function StatItem({ value, label, description }: Stat) {
  const ref = useRef<HTMLDivElement>(null);
  const { count, start } = useCountUp(value);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { start(); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [start]);

  return (
    <div ref={ref} className="text-center group">
      <div className="text-5xl sm:text-6xl font-display font-bold text-gold mb-2 group-hover:scale-105 transition-transform duration-300">
        {count}
      </div>
      <div className="text-white font-semibold text-lg mb-1">{label}</div>
      <div className="text-white/40 text-sm">{description}</div>
    </div>
  );
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const statItems: Stat[] = [
    { value: stats?.years ?? "10+", label: "Years Experience", description: "Trusted craftsmanship since 2014" },
    { value: stats?.projects ?? "250+", label: "Projects Completed", description: "Across Greater Sydney" },
    { value: stats?.clients ?? "200+", label: "Happy Clients", description: "Families & investors served" },
    { value: stats?.team ?? "50+", label: "Team Members", description: "Skilled professionals" },
  ];

  return (
    <section className="bg-dark-lighter py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {statItems.map((stat, i) => (
            <div key={i} className="relative">
              <StatItem {...stat} />
              {i < statItems.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gold/20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

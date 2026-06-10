"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Testimonial } from "@/types";
import { fadeUp, staggerContainer, viewportConfig } from "@/lib/animations";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent((c) => (c + dir + testimonials.length) % testimonials.length);
  };

  if (!testimonials.length) return null;
  const t = testimonials[current];

  return (
    <section className="relative bg-[#111113] py-28 lg:py-36 overflow-hidden">
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Background quote mark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <Quote size={320} className="text-white/[0.012] fill-white/[0.012]" strokeWidth={0.5} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-5">
            <span className="w-8 h-px bg-gold" />
            <span className="text-gold text-[11px] font-semibold uppercase tracking-[0.35em]">Client Stories</span>
            <span className="w-8 h-px bg-gold" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display font-bold text-[clamp(2rem,4vw,3rem)] text-white"
          >
            What Our Clients{" "}
            <span className="text-gold italic">Say</span>
          </motion.h2>
        </motion.div>

        {/* Testimonial */}
        <div className="relative min-h-[280px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center w-full"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-8">
                {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                  <Star key={i} size={16} className="text-gold fill-gold" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-display text-[clamp(1.3rem,2.5vw,2rem)] text-white/85 italic font-light leading-[1.5] mb-10 max-w-3xl mx-auto">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-white font-semibold text-sm tracking-wide">{t.name}</span>
                {(t.role || t.company) && (
                  <span className="text-white/30 text-xs">
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={() => go(-1)}
              className="w-10 h-10 border border-white/10 hover:border-gold/40 flex items-center justify-center text-white/30 hover:text-gold transition-all duration-300"
              aria-label="Previous"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className={`transition-all duration-300 ${
                    i === current ? "w-6 h-1.5 bg-gold" : "w-1.5 h-1.5 rounded-full bg-white/15 hover:bg-white/30"
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="w-10 h-10 border border-white/10 hover:border-gold/40 flex items-center justify-center text-white/30 hover:text-gold transition-all duration-300"
              aria-label="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

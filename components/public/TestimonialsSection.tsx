"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Testimonial } from "@/types";
import { fadeUp, staggerContainer, viewportConfig } from "@/lib/animations";

interface TestimonialsSectionProps { testimonials: Testimonial[] }

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const t = setInterval(() => { setDir(1); setCurrent((c) => (c + 1) % testimonials.length); }, 7000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  const go = (d: number) => { setDir(d); setCurrent((c) => (c + d + testimonials.length) % testimonials.length); };

  if (!testimonials.length) return null;
  const t = testimonials[current];

  return (
    // Warm cream section — premium builders use light sections for testimonials
    <section className="relative bg-[#F9F7F4] py-28 lg:py-36 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-dark/[0.06]" />

      {/* Decorative oversized quote mark */}
      <div className="absolute top-12 left-8 font-display font-black text-[20rem] leading-none text-dark/[0.025] select-none pointer-events-none">
        &ldquo;
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
            <span className="w-8 h-px bg-dark/20" />
            <span className="text-dark/40 text-[11px] font-semibold uppercase tracking-[0.35em]">Client Stories</span>
            <span className="w-8 h-px bg-dark/20" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display font-black text-[clamp(2.5rem,5vw,4rem)] text-dark leading-[0.95] tracking-[-0.03em]"
          >
            What Our Clients{" "}
            <span className="text-gold italic font-bold">Say</span>
          </motion.h2>
        </motion.div>

        {/* Testimonial slider */}
        <div className="relative min-h-[240px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={current}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: dir * -60, filter: "blur(6px)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center w-full"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-8">
                {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                  <Star key={i} size={15} className="text-gold fill-gold" />
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="font-display font-light italic text-[clamp(1.4rem,2.8vw,2.1rem)] text-dark/75 leading-[1.45] mb-10 max-w-3xl mx-auto tracking-[-0.01em]">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-[1.5px] bg-gold mb-1" />
                <span className="text-dark font-semibold text-sm tracking-wide">{t.name}</span>
                {(t.role || t.company) && (
                  <span className="text-dark/35 text-xs tracking-wider">
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
              className="w-10 h-10 border border-dark/15 hover:border-dark/40 flex items-center justify-center text-dark/25 hover:text-dark transition-all duration-300"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i); }}
                  className={`transition-all duration-300 ${
                    i === current
                      ? "w-6 h-1.5 bg-gold"
                      : "w-1.5 h-1.5 rounded-full bg-dark/15 hover:bg-dark/30"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="w-10 h-10 border border-dark/15 hover:border-dark/40 flex items-center justify-center text-dark/25 hover:text-dark transition-all duration-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

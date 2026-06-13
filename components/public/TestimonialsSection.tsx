"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { Testimonial } from "@/types";

const FALLBACK: Testimonial[] = [
  {
    id: "t1",
    name: "Sarah & Tom K.",
    role: "New Home Build",
    company: "Castle Hill",
    text: "We'd been through three builders who gave us the same box-plan in different colours. Build Demo spent four sessions just listening before they put pencil to paper. The result is a home that actually fits our family.",
    rating: 5,
    published: true,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t2",
    name: "Michael R.",
    role: "Knockdown Rebuild",
    company: "Kellyville",
    text: "Fixed price meant fixed price. Not a single variation we didn't approve first. That kind of honesty is rare in construction — and it made a genuinely stressful process feel manageable.",
    rating: 5,
    published: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t3",
    name: "Priya & David N.",
    role: "Duplex",
    company: "Norwest",
    text: "The project manager called every Friday at 4pm without us having to chase. When there was an issue with the slab they told us the same day. That communication made everything manageable.",
    rating: 5,
    published: true,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const items = testimonials.length > 0 ? testimonials : FALLBACK;
  const [current, setCurrent] = useState(0);

  const t = items[current];

  return (
    <section className="bg-surface py-28 lg:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative quote */}
      <div
        className="absolute font-display font-black text-[18rem] leading-none text-text/[0.025] select-none pointer-events-none"
        style={{ top: "12px", left: "2rem" }}
        aria-hidden
      >
        &ldquo;
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          className="text-center mb-16"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22,1,0.36,1] } } }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <span className="w-8 h-px bg-text/20" />
            <span className="text-text/40 text-[11px] font-semibold uppercase tracking-[0.4em]">Client Stories</span>
            <span className="w-8 h-px bg-text/20" />
          </motion.div>
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22,1,0.36,1] } } }}
            className="font-display font-black text-[clamp(2.4rem,5vw,4rem)] text-text leading-[0.95] tracking-[-0.03em]"
          >
            What our clients{" "}
            <em className="text-accent-primary not-italic">say</em>
          </motion.h2>
        </motion.div>

        {/* Slider */}
        <div className="relative min-h-[260px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center w-full"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-8">
                {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                  <Star key={i} size={14} className="text-accent-primary fill-accent-primary" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-display font-light italic text-[clamp(1.3rem,2.5vw,1.95rem)] text-text/72 leading-[1.5] mb-10 max-w-3xl mx-auto tracking-[-0.01em]">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-[1.5px] bg-accent-primary mb-1" />
                <span className="text-text font-semibold text-sm">{t.name}</span>
                {(t.role || t.company) && (
                  <span className="text-text/35 text-xs tracking-wide">
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot navigation */}
        {items.length > 1 && (
          <div className="flex justify-center gap-2.5 mt-10">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 ${
                  i === current
                    ? "w-7 h-[3px] bg-accent-primary"
                    : "w-[6px] h-[6px] rounded-full bg-text/18 hover:bg-text/35"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

const STAGES = [
  {
    number: "01",
    tag: "Consult",
    headline: ["We listen before", "we measure."],
    body: "Before we draw a line or quote a figure, we sit with you — really sit. We want to understand your household's rhythms, your budget's actual ceiling, and what 'home' means to your specific family. Consultations run long because the questions that matter rarely surface in the first fifteen minutes.",
    detail: "Unlike most builders, we don't start with a fixed catalogue. We start with you.",
  },
  {
    number: "02",
    tag: "Design",
    headline: ["Plans that anticipate", "what others miss."],
    body: "Our in-house designers balance what you want with what council permits and what the block allows. You'll review 3D walkthroughs of every room before a single permit is lodged. We design for how rooms are used at 7am on a Tuesday, not just for how they photograph.",
    detail: "Full architectural drawings, council submissions and engineering — all in-house.",
  },
  {
    number: "03",
    tag: "Build",
    headline: ["Every trade on this site", "answers to us."],
    body: "We don't broker your build to the lowest bidder and hope for the best. Our licensed builders, structural engineers and long-term subcontractors execute to a precise program. You get site access any day, a direct line to your project manager, and a written update every Friday.",
    detail: "Fixed-price contracts. What we quote is what you pay — unless you change the scope.",
  },
  {
    number: "04",
    tag: "Handover",
    headline: ["The house is complete.", "The relationship isn't."],
    body: "We walk every room with you before you take the keys. Every defect is documented and resolved. You leave with full warranty documentation, a detailed home manual and a direct contact for anything that comes up in the next five years.",
    detail: "5-year structural warranty. Post-handover support that actually picks up.",
  },
];

function StageContent({ s, i }: { s: (typeof STAGES)[0]; i: number }) {
  return (
    <motion.div
      key={`stage-${i}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex flex-col justify-center px-8 sm:px-14 lg:px-20 pt-20 pb-28 max-w-3xl"
    >
      {/* Watermark number */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 font-display font-black leading-none select-none pointer-events-none"
        style={{
          fontSize: "clamp(160px, 22vw, 320px)",
          color: "rgba(181,105,74,0.05)",
          letterSpacing: "-0.06em",
        }}
      >
        {s.number}
      </div>

      {/* Tag */}
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 mb-8 relative z-10"
      >
        <span className="w-7 h-px bg-accent-primary" />
        <span className="text-accent-primary text-[11px] font-bold uppercase tracking-[0.42em]">{s.tag}</span>
        <span className="text-text/20 text-[11px] ml-1">— Stage {s.number}</span>
      </motion.div>

      {/* Headline */}
      <div className="relative z-10 mb-8">
        {s.headline.map((line, li) => (
          <motion.div
            key={`${line}-${li}`}
            initial={{ opacity: 0, y: 45, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, delay: 0.12 + li * 0.13, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black text-text leading-[0.92] tracking-[-0.04em]"
            style={{ fontSize: "clamp(2.6rem,5.5vw,5rem)" }}
          >
            {line}
          </motion.div>
        ))}
      </div>

      {/* Body */}
      <motion.p
        initial={{ opacity: 0, y: 22, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-text/50 text-[1.02rem] leading-[1.88] max-w-md mb-7"
      >
        {s.body}
      </motion.p>

      {/* Differentiator */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex items-start gap-3 max-w-md"
      >
        <div className="w-[3px] self-stretch min-h-[36px] bg-accent-primary flex-shrink-0" />
        <p className="text-accent-primary/65 text-sm leading-relaxed italic">{s.detail}</p>
      </motion.div>
    </motion.div>
  );
}

export default function ProcessSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(Math.floor(v * STAGES.length), STAGES.length - 1);
    if (idx !== active) setActive(idx);
  });

  return (
    <div ref={outerRef} style={{ height: `${STAGES.length * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden bg-bg">

        {/* Subtle right panel */}
        <div className="absolute right-0 top-0 bottom-0 w-[28%] bg-surface/40" />

        {/* Top label */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 sm:px-14 lg:px-20 pt-10">
          <div className="flex items-center gap-3">
            <span className="w-5 h-px bg-text/18" />
            <span className="text-text/28 text-[10px] font-semibold uppercase tracking-[0.42em]">
              The Build Journey
            </span>
          </div>
          <div className="font-mono text-sm tracking-widest">
            <span className="text-accent-primary font-display font-black text-xl">
              {String(active + 1).padStart(2, "0")}
            </span>
            <span className="text-text/15"> / 04</span>
          </div>
        </div>

        {/* Stage content */}
        <div className="relative z-10 h-full">
          <AnimatePresence mode="wait">
            <StageContent key={active} s={STAGES[active]} i={active} />
          </AnimatePresence>
        </div>

        {/* Right sidebar nav */}
        <div className="absolute right-10 lg:right-16 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-7">
          {STAGES.map((s, i) => (
            <motion.div
              key={s.number}
              animate={{ opacity: i === active ? 1 : 0.2 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{
                  height: i === active ? 42 : 14,
                  backgroundColor: i <= active ? "#B5694A" : "rgba(28,27,25,0.12)",
                }}
                transition={{ duration: 0.35 }}
                className="w-[2px] rounded-full"
              />
              <div>
                <div className="text-text/25 text-[9px] uppercase tracking-[0.3em]">{s.number}</div>
                <div className={`text-[11px] font-medium transition-colors duration-300 ${i === active ? "text-text" : "text-text/22"}`}>
                  {s.tag}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom progress */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-8 sm:px-14 lg:px-20 pb-8">
          <div className="flex items-center gap-2 mb-4">
            {STAGES.map((s, i) => (
              <div key={s.number} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    width: i === active ? 28 : i < active ? 14 : 8,
                    backgroundColor:
                      i === active ? "#B5694A" : i < active ? "rgba(181,105,74,0.38)" : "rgba(28,27,25,0.12)",
                  }}
                  transition={{ duration: 0.35 }}
                  className="h-[2px] rounded-full"
                />
                {i === active && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-accent-primary/60 text-[10px] uppercase tracking-[0.3em]"
                  >
                    {s.tag}
                  </motion.span>
                )}
              </div>
            ))}
          </div>
          <div className="w-full h-px bg-text/[0.06] relative overflow-hidden">
            <motion.div
              animate={{ width: `${((active + 0.5) / STAGES.length) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 left-0 h-full bg-accent-primary"
            />
          </div>
          <AnimatePresence>
            {active === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 text-text/22"
              >
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((n) => (
                    <motion.div
                      key={n}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.4, delay: n * 0.2, repeat: Infinity }}
                      className="w-0.5 h-3 bg-text/20 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em]">Scroll through the journey</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

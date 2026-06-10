"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ClipboardList, PenTool, HardHat, KeyRound } from "lucide-react";
import { fadeUp, staggerContainer, viewportConfig } from "@/lib/animations";

const STEPS = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Discovery & Vision",
    sub: "We listen first.",
    body: "Every great home starts with a conversation. We take time to understand your lifestyle, budget and goals — then align them with what's possible. No pressure, no jargon.",
    accent: "from-gold/20 to-transparent",
  },
  {
    num: "02",
    icon: PenTool,
    title: "Design & Approval",
    sub: "Your vision, drawn to life.",
    body: "Our in-house design team creates plans that balance aesthetics with practicality and council compliance. We handle all permits and approvals so you don't have to.",
    accent: "from-blue-500/10 to-transparent",
  },
  {
    num: "03",
    icon: HardHat,
    title: "Build & Construct",
    sub: "Craftsmanship at every step.",
    body: "Licensed builders and trusted tradespeople work to a structured program with regular site inspections and progress updates. You're never left wondering what's happening.",
    accent: "from-emerald-500/10 to-transparent",
  },
  {
    num: "04",
    icon: KeyRound,
    title: "Handover & Beyond",
    sub: "The beginning of your story.",
    body: "We walk you through your completed home, hand over a defect-free build with full documentation, and remain your point of contact for years post-handover.",
    accent: "from-gold/15 to-transparent",
  },
];

function Step({ step, index }: { step: (typeof STEPS)[0]; index: number }) {
  const isRight = index % 2 !== 0;
  const Icon = step.icon;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[280px] ${isRight ? "" : ""}`}>
      {/* Number side */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={isRight ? { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } } : { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
        className={`relative flex items-center justify-center p-12 lg:p-16 bg-gradient-to-br ${step.accent} bg-[#0D0D10] border border-white/[0.04] overflow-hidden ${isRight ? "lg:order-2" : ""}`}
      >
        {/* Giant number watermark */}
        <span
          className="absolute font-display font-black text-[12rem] leading-none select-none pointer-events-none"
          style={{ color: "rgba(201,168,76,0.04)" }}
        >
          {step.num}
        </span>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto mb-5">
            <Icon size={26} className="text-gold" />
          </div>
          <div className="font-display font-black text-7xl text-white/8 leading-none">{step.num}</div>
        </div>
      </motion.div>

      {/* Content side */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={staggerContainer}
        className={`flex flex-col justify-center p-12 lg:p-16 border border-white/[0.04] bg-[#0A0A0B] ${isRight ? "lg:order-1" : ""}`}
      >
        <motion.span
          variants={fadeUp}
          className="text-gold text-[11px] font-bold uppercase tracking-[0.35em] mb-3"
        >
          Step {step.num}
        </motion.span>
        <motion.h3
          variants={fadeUp}
          className="font-display font-bold text-[clamp(1.8rem,3vw,2.5rem)] text-white leading-tight mb-2"
        >
          {step.title}
        </motion.h3>
        <motion.p
          variants={fadeUp}
          className="text-gold/60 text-sm font-medium italic mb-5"
        >
          {step.sub}
        </motion.p>
        <motion.p variants={fadeUp} className="text-white/40 text-base leading-[1.9] max-w-sm">
          {step.body}
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function ProcessSection() {
  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 70%", "end 30%"],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="relative bg-[#0A0A0B] py-28 lg:py-36 overflow-hidden">
      {/* Top + bottom rules */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-gold" />
            <span className="text-gold text-[11px] font-semibold uppercase tracking-[0.38em]">
              The Build Journey
            </span>
            <span className="w-8 h-px bg-gold" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display font-bold text-[clamp(2.5rem,5vw,4rem)] text-white leading-tight"
          >
            From Vision to{" "}
            <span className="text-gold italic">Keys in Hand</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-white/35 text-lg mt-5 max-w-xl mx-auto leading-relaxed"
          >
            A transparent, step-by-step process so you always know exactly where your home is at.
          </motion.p>
        </motion.div>

        {/* ── Steps grid with animated connecting line ── */}
        <div ref={lineRef} className="relative">

          {/* Animated vertical connector (desktop only) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px hidden lg:block overflow-hidden">
            <motion.div
              style={{ scaleY: lineScaleY }}
              className="w-full h-full bg-gradient-to-b from-gold/60 via-gold/30 to-transparent origin-top"
            />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 gap-px">
            {STEPS.map((step, i) => (
              <Step key={step.num} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

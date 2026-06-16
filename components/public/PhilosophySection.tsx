"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const LINES = [
  "We build homes",
  "people live in —",
  "not showrooms",
  "they walk through.",
];

function RevealLine({
  children,
  progress,
  rangeIn,
  rangeOut,
  accent = false,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  rangeIn: [number, number];
  rangeOut?: [number, number];
  accent?: boolean;
}) {
  const opacity = useTransform(
    progress,
    rangeOut
      ? [rangeIn[0], rangeIn[1], rangeOut[0], rangeOut[1]]
      : [rangeIn[0], rangeIn[1]],
    rangeOut ? [0.08, 1, 1, 0.08] : [0.08, 1]
  );
  const y = useTransform(progress, [rangeIn[0], rangeIn[1]], [28, 0]);

  return (
    <motion.span
      style={{ opacity, y, display: "block" }}
      className={accent ? "text-accent-primary" : "text-text"}
    >
      {children}
    </motion.span>
  );
}

export default function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.3"],
  });

  return (
    <section
      ref={sectionRef}
      className="relative bg-bg py-32 lg:py-56 px-6 sm:px-10 lg:px-16 overflow-hidden"
    >
      {/* Morphing blob — ambient decorative accent, reduced-motion respects .blob-morph */}
      <div
        aria-hidden
        className="blob-morph absolute -top-40 -right-40 w-[520px] h-[520px] bg-accent-primary/[0.06] pointer-events-none"
      />
      <div className="max-w-[1200px] mx-auto">

        {/* Scroll-driven headline — each line enters sequentially */}
        <h2
          className="font-display font-black leading-[0.88] tracking-[-0.04em] mb-16 lg:mb-20"
          style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
        >
          {LINES.map((line, i) => {
            const step = 0.22;
            const gap = 0.06;
            return (
              <RevealLine
                key={line}
                progress={scrollYProgress}
                rangeIn={[i * (step + gap), i * (step + gap) + step]}
                accent={i === 1}
              >
                {line}
              </RevealLine>
            );
          })}
        </h2>

        {/* Body — two-column, asymmetric indent on the right */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-20 lg:pl-[8%]"
        >
          <p className="text-text/50 text-[1.05rem] leading-[1.9] text-pretty">
            Most builders hand you a fixed catalogue and call it custom. We start
            with how your household actually works: the morning routine, how your
            kids use the backyard, whether you work from home three days a week.
            Then we design around that — not around what&apos;s easiest to build.
          </p>
          <p className="text-text/50 text-[1.05rem] leading-[1.9] text-pretty">
            Our projects take longer to plan. They take far less time to regret.
            Every home we deliver earns a five-star review or we understand why
            not — and we fix it. That&apos;s been the only operating principle
            since we broke ground on our first project in Western Sydney in 2016.
          </p>
        </motion.div>

        {/* Accent rule — drawn in on scroll */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 h-px bg-accent-primary/25 origin-left"
        />
      </div>
    </section>
  );
}

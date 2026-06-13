"use client";

import { motion } from "framer-motion";

const blurUp = {
  hidden: { opacity: 0, y: 44, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

export default function PhilosophySection() {
  return (
    <section className="bg-bg py-28 lg:py-44 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          {/* Label */}
          <motion.div variants={blurUp} className="flex items-center gap-3 mb-10">
            <span className="w-10 h-px bg-accent-secondary" />
            <span className="text-accent-secondary text-[11px] font-semibold uppercase tracking-[0.42em]">
              Our Philosophy
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={blurUp}
            className="font-display font-black text-[clamp(2.2rem,5.5vw,4.8rem)] text-text leading-[0.9] tracking-[-0.035em] mb-12"
          >
            We build homes people{" "}
            <em className="text-accent-primary not-italic">live in</em>
            {" "}—{" "}
            <br className="hidden lg:block" />
            not showrooms they walk through.
          </motion.h2>

          {/* Two-column body */}
          <motion.div
            variants={stagger}
            className="grid lg:grid-cols-2 gap-8 lg:gap-20"
          >
            <motion.p variants={blurUp} className="text-text/52 text-[1.05rem] leading-[1.9]">
              Most builders hand you a fixed catalogue and call it custom. We start with how your household actually works: the morning routine, the way your kids use the backyard, whether you work from home three days a week. Then we design around that — not around what&apos;s easiest to build.
            </motion.p>
            <motion.p variants={blurUp} className="text-text/52 text-[1.05rem] leading-[1.9]">
              Our projects take longer to plan. They take far less time to regret. Every home we deliver earns a five-star review or we understand why not — and we fix it. That&apos;s been the only operating principle since we broke ground on our first project in Western Sydney in 2016.
            </motion.p>
          </motion.div>

          {/* Divider accent */}
          <motion.div
            variants={blurUp}
            className="mt-16 h-px bg-gradient-to-r from-accent-primary/30 via-accent-secondary/20 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}

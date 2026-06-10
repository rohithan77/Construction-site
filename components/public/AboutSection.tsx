"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { staggerContainer, viewportConfig } from "@/lib/animations";

interface AboutSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
}

const VALUES = [
  "Uncompromising build quality",
  "Transparent communication",
  "On-time, on-budget delivery",
  "Innovative design solutions",
  "Licensed & fully insured",
  "After-handover support",
];

const MILESTONES = [
  { year: "1999", text: "Founded in Western Sydney" },
  { year: "2010", text: "Expanded to commercial" },
  { year: "2018", text: "500th home delivered" },
  { year: "2024", text: "Team of 50+ specialists" },
];

// Blur-fade reveal — the premium text animation pattern per research
const blurFadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

const blurStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AboutSection({ title, subtitle, description, image }: AboutSectionProps) {
  const imgSrc =
    image || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80";

  return (
    <section className="relative bg-[#0A0A0B] py-28 lg:py-40 overflow-hidden">
      {/* Background glow */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gold/[0.03] blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-28 items-center">

          {/* ── Right: Content (first on mobile) ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={blurStagger}
            className="order-1"
          >
            <motion.div variants={blurFadeUp} className="flex items-center gap-3 mb-7">
              <span className="w-8 h-px bg-gold" />
              <span className="text-gold text-[11px] font-semibold uppercase tracking-[0.38em]">About Build Demo</span>
            </motion.div>

            <motion.h2
              variants={blurFadeUp}
              className="font-display font-black text-[clamp(2.5rem,5vw,4.5rem)] text-white leading-[0.93] tracking-[-0.04em] mb-6"
            >
              {title || "25 Years"}{" "}
              <span className="text-gold italic font-bold">{subtitle || "Building Dreams"}</span>
            </motion.h2>

            <motion.p
              variants={blurFadeUp}
              className="text-white/38 text-[1rem] leading-[1.9] mb-10 max-w-md"
            >
              {description ||
                "Build Demo has been Greater Sydney's trusted construction partner since 1999. From custom single homes to multi-dwelling developments, we bring together skilled tradespeople, rigorous quality control and transparent project management to deliver results that exceed expectations — every time."}
            </motion.p>

            {/* Values */}
            <motion.div variants={blurStagger} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {VALUES.map((v) => (
                <motion.div key={v} variants={blurFadeUp} className="flex items-center gap-3 group">
                  <CheckCircle2 size={14} className="text-gold flex-shrink-0" />
                  <span className="text-white/45 text-sm group-hover:text-white/75 transition-colors duration-200">{v}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Timeline strip */}
            <motion.div
              variants={blurFadeUp}
              className="grid grid-cols-4 gap-4 py-6 border-y border-white/[0.06] mb-10"
            >
              {MILESTONES.map(({ year, text }) => (
                <div key={year}>
                  <div className="text-gold font-display font-black text-lg leading-none">{year}</div>
                  <div className="text-white/25 text-[10px] leading-tight mt-1.5">{text}</div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={blurFadeUp}>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2.5 bg-gold hover:bg-gold-light text-dark font-black text-[13px] uppercase tracking-[0.2em] px-8 py-4 transition-all duration-300 hover:shadow-[0_20px_60px_-10px_rgba(201,168,76,0.4)]"
              >
                Our Full Story
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Left: Image with clip-path reveal ── */}
          <div className="relative order-2 lg:order-2">
            <div className="relative h-[520px] lg:h-[660px]">
              {/* Clip-path curtain reveal */}
              <motion.div
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                whileInView={{ clipPath: "inset(0 0% 0 0)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 overflow-hidden"
              >
                <Image
                  src={imgSrc}
                  alt="Build Demo construction team"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0B]/50 via-transparent to-transparent" />
              </motion.div>

              {/* Gold corner accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold" />

              {/* Floating stats card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-6 -right-4 lg:-right-8 bg-[#111116] border border-white/10 p-6 shadow-2xl"
              >
                <div className="text-gold font-display font-black text-4xl leading-none mb-1">500+</div>
                <div className="text-white/30 text-[10px] uppercase tracking-[0.25em]">Homes Built</div>
                <div className="mt-3 space-y-1">
                  {MILESTONES.slice(0, 2).map(({ year, text }) => (
                    <div key={year} className="flex gap-2 items-start">
                      <span className="text-gold text-[10px] font-bold mt-0.5">{year}</span>
                      <span className="text-white/25 text-[10px] leading-tight">{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

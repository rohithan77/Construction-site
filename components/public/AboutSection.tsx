"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { fadeUp, slideInLeft, slideInRight, staggerContainer, viewportConfig } from "@/lib/animations";

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
  { year: "2010", text: "Expanded to commercial builds" },
  { year: "2018", text: "500th home milestone" },
  { year: "2024", text: "Award-winning team of 50+" },
];

export default function AboutSection({ title, subtitle, description, image }: AboutSectionProps) {
  const imgSrc =
    image || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80";

  return (
    <section className="relative bg-[#0A0A0B] py-28 lg:py-40 overflow-hidden">
      {/* Background glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gold/3 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* ── Left: Image ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={slideInLeft}
            className="relative order-2 lg:order-1"
          >
            <div className="relative h-[500px] lg:h-[620px]">
              {/* Main image */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={imgSrc}
                  alt="Build Demo construction team at work"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0B]/60 via-transparent to-transparent" />
              </div>

              {/* Gold corner accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold" />

              {/* Floating milestone card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-6 -right-6 lg:-right-10 bg-[#111116] border border-white/10 p-6 shadow-2xl w-52"
              >
                <div className="space-y-3">
                  {MILESTONES.slice(-2).map(({ year, text }) => (
                    <div key={year} className="flex gap-3 items-start">
                      <span className="text-gold font-display font-bold text-xs mt-0.5 whitespace-nowrap">{year}</span>
                      <span className="text-white/40 text-[11px] leading-tight">{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* ── Right: Content ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
            className="order-1 lg:order-2"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-gold" />
              <span className="text-gold text-[11px] font-semibold uppercase tracking-[0.35em]">About Build Demo</span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display font-bold text-[clamp(2.2rem,4vw,3.5rem)] text-white leading-tight mb-6"
            >
              {title || "25 Years Building"}{" "}
              <span className="text-gold italic">{subtitle || "Sydney's Finest Homes"}</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-white/40 text-base leading-[1.9] mb-10"
            >
              {description ||
                "Build Demo has been Greater Sydney's trusted construction partner since 1999. From custom single homes to multi-dwelling developments, we bring together skilled tradespeople, rigorous quality control and transparent project management to deliver results that exceed expectations — every time."}
            </motion.p>

            {/* Values grid */}
            <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {VALUES.map((v) => (
                <motion.div
                  key={v}
                  variants={fadeUp}
                  className="flex items-center gap-3 group"
                >
                  <CheckCircle2 size={15} className="text-gold flex-shrink-0" />
                  <span className="text-white/50 text-sm group-hover:text-white/80 transition-colors duration-200">{v}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Timeline strip */}
            <motion.div variants={fadeUp} className="flex gap-6 mb-10 py-6 border-y border-white/[0.05]">
              {MILESTONES.map(({ year, text }) => (
                <div key={year} className="flex-1">
                  <div className="text-gold font-display font-bold text-lg">{year}</div>
                  <div className="text-white/30 text-[10px] leading-tight mt-1">{text}</div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2.5 bg-gold hover:bg-gold-light text-dark font-bold px-8 py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:shadow-[0_20px_60px_-12px_rgba(201,168,76,0.4)]"
              >
                Our Full Story
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

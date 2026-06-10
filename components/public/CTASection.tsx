"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { fadeUp, staggerContainer, viewportConfig } from "@/lib/animations";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
}

export default function CTASection({
  title = "Ready to Build Your Dream?",
  subtitle = "From initial concept to final handover — Build Demo is with you every step of the way. Get your free consultation today.",
}: CTASectionProps) {
  return (
    <section className="relative bg-gold overflow-hidden py-24 lg:py-32">
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#1C1C1E 1px, transparent 1px), linear-gradient(90deg, #1C1C1E 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(28,28,30,0.2))]" />

      {/* Decorative number */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 font-display font-black text-[20vw] text-dark/[0.04] leading-none select-none pointer-events-none">
        BD
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-dark/30" />
            <span className="text-dark/60 text-[11px] font-semibold uppercase tracking-[0.35em]">Start Your Project</span>
            <span className="w-8 h-px bg-dark/30" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="font-display font-bold text-[clamp(2.5rem,5vw,4.5rem)] text-dark leading-[1.05] mb-6"
          >
            {title}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-dark/55 text-lg leading-relaxed max-w-xl mx-auto mb-12"
          >
            {subtitle}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2.5 bg-dark hover:bg-[#0A0A0B] text-white font-bold px-10 py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:shadow-2xl"
            >
              Get a Free Quote
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:+61400000000"
              className="group inline-flex items-center justify-center gap-2.5 border-2 border-dark/30 hover:border-dark text-dark font-bold px-10 py-4 text-sm uppercase tracking-widest transition-all duration-300"
            >
              <Phone size={14} />
              Call +61 400 000 000
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

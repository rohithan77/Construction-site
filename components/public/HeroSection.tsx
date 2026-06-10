"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Award, Shield, Clock } from "lucide-react";
import { ease } from "@/lib/animations";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
}

const HEADLINE_LINES = ["Building", "Extraordinary", "Homes."];

export default function HeroSection({
  subtitle = "Premium residential and commercial construction across Greater Sydney — new homes, duplexes, granny flats and knockdown rebuilds, built with precision and pride.",
  ctaPrimary = "View Our Work",
  ctaSecondary = "Free Consultation",
}: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Scroll-linked parallax: content fades & lifts as user scrolls past hero
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgScale    = useTransform(scrollYProgress, [0, 1], [1.0, 1.15]);
  const bgOpacity  = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);
  const contentY   = useTransform(scrollYProgress, [0, 1], ["0px", "-120px"]);
  const contentOp  = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[700px] overflow-hidden flex flex-col"
    >
      {/* ── Video / image background ─────────────────────────────── */}
      <motion.div className="absolute inset-0 z-0" style={{ scale: bgScale, opacity: bgOpacity }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&auto=format&fit=crop&q=80"
        >
          {/* Replace with your own video for production */}
          <source
            src="https://videos.pexels.com/video-files/2792358/2792358-hd_1280_720_30fps.mp4"
            type="video/mp4"
          />
        </video>
      </motion.div>

      {/* ── Overlays ─────────────────────────────────────────────── */}
      {/* Left dark vignette so text is always readable */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0A0A0B]/95 via-[#0A0A0B]/65 to-transparent" />
      {/* Bottom vignette for smooth section blend */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0A0A0B] via-transparent to-[#0A0A0B]/30" />
      {/* Subtle grain */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── Content ──────────────────────────────────────────────── */}
      <motion.div
        style={{ y: contentY, opacity: contentOp }}
        className="relative z-10 flex-1 flex items-center"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl xl:max-w-3xl">

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease }}
              className="flex items-center gap-3 mb-10"
            >
              <span className="w-10 h-[1.5px] bg-gold" />
              <span className="text-gold text-[11px] font-semibold tracking-[0.38em] uppercase">
                Greater Sydney's Premier Builder
              </span>
            </motion.div>

            {/* Headline — line-by-line reveal */}
            <div className="mb-8 overflow-hidden">
              {HEADLINE_LINES.map((line, i) => (
                <div key={i} className="overflow-hidden leading-[1.02]">
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.2, ease }}
                    className={`block font-display font-black tracking-tight text-[clamp(3.5rem,7vw,6.5rem)] leading-[1.02] ${
                      i === 1 ? "text-gold italic" : "text-white"
                    }`}
                  >
                    {line}
                  </motion.span>
                </div>
              ))}
            </div>

            {/* Divider line */}
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.8, ease }}
              className="w-24 h-px bg-white/20 mb-8"
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9, ease }}
              className="text-white/50 text-[1.05rem] leading-[1.85] max-w-[500px] mb-12"
            >
              {subtitle}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.05, ease }}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <Link
                href="/projects"
                className="group inline-flex items-center justify-center gap-2.5 bg-gold hover:bg-gold-light text-dark font-black text-[13px] uppercase tracking-[0.2em] px-10 py-4 transition-all duration-300 hover:shadow-[0_20px_60px_-10px_rgba(201,168,76,0.5)]"
              >
                {ctaPrimary}
                <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2.5 border border-white/15 hover:border-gold/50 text-white/55 hover:text-white font-semibold text-[13px] uppercase tracking-[0.2em] px-10 py-4 transition-all duration-300 backdrop-blur-sm"
              >
                {ctaSecondary}
                <ArrowRight size={15} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1.25, ease }}
              className="flex flex-wrap gap-6"
            >
              {[
                { icon: Shield, text: "Licensed & Insured" },
                { icon: Award, text: "Award-Winning Builder" },
                { icon: Clock, text: "On-Time Guarantee" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <Icon size={13} className="text-gold" />
                  <span className="text-white/40 text-xs tracking-wide">{text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Scroll indicator ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="relative z-10 flex flex-col items-center pb-8 gap-1"
      >
        <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ChevronDown size={16} className="text-gold/40" />
        </motion.div>
      </motion.div>

      {/* ── Bottom stats strip ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="relative z-10 bg-white/[0.03] backdrop-blur-md border-t border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { v: "500+", l: "Homes Built" },
              { v: "25+", l: "Years Experience" },
              { v: "98%", l: "Client Satisfaction" },
              { v: "50+", l: "Team Members" },
            ].map(({ v, l }, i) => (
              <div key={l} className={`py-5 px-6 text-center ${i < 3 ? "border-r border-white/[0.06]" : ""}`}>
                <div className="text-gold font-display font-black text-xl">{v}</div>
                <div className="text-white/25 text-[10px] tracking-widest uppercase mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

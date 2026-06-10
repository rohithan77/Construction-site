"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Shield, Award, Clock } from "lucide-react";
import { ease } from "@/lib/animations";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
}

const STATS = [
  { value: "500+", label: "Projects Delivered" },
  { value: "25+", label: "Years Experience" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "50+", label: "Expert Team" },
];

export default function HeroSection({
  title = "Building Dreams,\nDelivering Excellence.",
  subtitle = "Premium residential and commercial construction across Greater Sydney. New homes, duplexes, granny flats and knockdown rebuilds — built with precision and pride.",
  ctaPrimary = "View Our Work",
  ctaSecondary = "Get a Free Quote",
}: HeroSectionProps) {
  const lines = title.split("\n");

  return (
    <section className="relative min-h-screen bg-[#0A0A0B] overflow-hidden flex flex-col">
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Glow blob top right */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      {/* Glow blob bottom left */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gold/3 blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

            {/* ── Left column ── */}
            <div>
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease }}
                className="flex items-center gap-3 mb-10"
              >
                <span className="block w-8 h-px bg-gold" />
                <span className="text-gold text-[11px] font-semibold tracking-[0.35em] uppercase">
                  Greater Sydney's Premier Builder
                </span>
              </motion.div>

              {/* Headline */}
              <div className="mb-8 overflow-hidden">
                {lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: "105%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{ duration: 0.85, delay: 0.15 + i * 0.18, ease }}
                    className={`block font-display font-bold leading-[1.03] tracking-tight text-[clamp(3rem,6vw,5.5rem)] ${
                      i === lines.length - 1
                        ? "text-gold"
                        : "text-white"
                    }`}
                  >
                    {line}
                  </motion.div>
                ))}
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55, ease }}
                className="text-white/45 text-lg leading-[1.8] max-w-[480px] mb-10"
              >
                {subtitle}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.75, ease }}
                className="flex flex-col sm:flex-row gap-4 mb-14"
              >
                <Link
                  href="/projects"
                  className="group inline-flex items-center justify-center gap-2.5 bg-gold hover:bg-gold-light text-dark font-bold px-8 py-4 text-sm uppercase tracking-widest transition-all duration-300 hover:shadow-[0_20px_60px_-12px_rgba(201,168,76,0.45)]"
                >
                  {ctaPrimary}
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-2.5 border border-white/10 hover:border-gold/40 text-white/60 hover:text-white font-semibold px-8 py-4 text-sm uppercase tracking-widest transition-all duration-300"
                >
                  {ctaSecondary}
                  <ArrowRight
                    size={15}
                    className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                  />
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1, ease }}
                className="flex flex-wrap gap-6"
              >
                {[
                  { icon: Shield, label: "Licensed & Insured", sub: "NSW & ACT" },
                  { icon: Award, label: "Award Winning", sub: "Builder 2023" },
                  { icon: Clock, label: "On-Time Delivery", sub: "Guaranteed" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-white/80 text-xs font-semibold leading-tight">{label}</p>
                      <p className="text-white/30 text-[10px] leading-tight mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Right column: image ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.3, ease }}
              className="relative hidden lg:block"
            >
              <div className="relative h-[580px] xl:h-[640px]">
                {/* Image */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1000&auto=format&fit=crop&q=85"
                    alt="Premium construction by Build Demo"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/80 via-[#0A0A0B]/10 to-transparent" />
                </div>

                {/* Gold corner accents */}
                <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-gold" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-gold" />

                {/* Floating experience card */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.1, ease }}
                  className="absolute -bottom-6 -left-8 bg-gold px-8 py-6 shadow-2xl z-10"
                >
                  <div className="text-dark font-display font-black text-5xl leading-none">25</div>
                  <div className="text-dark/70 text-[11px] uppercase tracking-[0.2em] mt-1.5">
                    Years of Excellence
                  </div>
                </motion.div>

                {/* Secondary floating badge */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.3, ease }}
                  className="absolute top-8 -right-6 bg-dark-lighter border border-white/10 px-6 py-4 shadow-xl z-10"
                >
                  <div className="text-white font-display font-bold text-2xl">500+</div>
                  <div className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-0.5">
                    Homes Built
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats bar at the very bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4, ease }}
        className="relative z-10 border-t border-white/5 bg-white/[0.015] backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {STATS.map(({ value, label }, i) => (
              <div
                key={label}
                className={`py-6 px-6 text-center ${
                  i < STATS.length - 1 ? "border-r border-white/5" : ""
                }`}
              >
                <div className="text-gold font-display font-bold text-2xl mb-1">{value}</div>
                <div className="text-white/30 text-[11px] tracking-wider uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-24 right-8 hidden lg:flex flex-col items-center gap-2 text-white/20"
      >
        <div className="w-px h-16 bg-gradient-to-b from-transparent to-gold/40" />
        <ChevronDown size={14} className="text-gold/40 animate-bounce" />
      </motion.div>
    </section>
  );
}

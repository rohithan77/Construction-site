"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ─── Story chapters ───────────────────────────────────────────────────── */
const CHAPTERS = [
  {
    phase: "01",
    tag: "Discovery",
    headline: ["Every great home", "starts with one", "conversation."],
    body: "Before a single line is drawn we sit with you — really listen — to understand your lifestyle, your family, your budget. No sales pitch. No pressure. Just an honest map of what's possible.",
    why: "Unlike most builders, we don't rush to a quote. We take the time to get it right.",
    img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&auto=format&fit=crop&q=85",
    color: "#C9A84C",
  },
  {
    phase: "02",
    tag: "Design",
    headline: ["Your vision,", "drawn to life", "in perfect detail."],
    body: "Our in-house architects translate your ideas into fully detailed plans — balancing aesthetics, council compliance and livability. You'll walk through every room virtually before a brick is laid.",
    why: "No outsourcing. Our own architects. Your plans, your way.",
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&auto=format&fit=crop&q=85",
    color: "#E2C47A",
  },
  {
    phase: "03",
    tag: "Construction",
    headline: ["Precision.", "Craftsmanship.", "50 experts,", "working for you."],
    body: "Our licensed builders, structural engineers and trusted tradespeople execute to a tight program. Open site access. Weekly progress updates. Zero surprises. Your project manager's number — always available.",
    why: "Fixed-price contracts. What we quote is what you pay.",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&auto=format&fit=crop&q=85",
    color: "#C9A84C",
  },
  {
    phase: "04",
    tag: "Your New Home",
    headline: ["Keys in hand.", "A new chapter", "begins today."],
    body: "We walk you through every room of a defect-free home. Full warranty documentation, detailed handover guide, and a dedicated contact for the years ahead. This isn't goodbye — it's the start of a long relationship.",
    why: "5-year structural warranty and post-handover support. Because we stand behind every build.",
    img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&auto=format&fit=crop&q=85",
    color: "#C9A84C",
  },
];

/* ─── Chapter content — fades in/out as chapters change ──────────────── */
function ChapterContent({ ch, i }: { ch: (typeof CHAPTERS)[0]; i: number }) {
  return (
    <motion.div
      key={`content-${i}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 flex flex-col justify-center px-8 sm:px-14 lg:px-20 pt-24 pb-32 max-w-3xl"
    >
      {/* Phase number watermark */}
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2 font-display font-black leading-none select-none pointer-events-none"
        style={{
          fontSize: "clamp(180px, 25vw, 340px)",
          color: "rgba(201,168,76,0.04)",
          letterSpacing: "-0.06em",
        }}
      >
        {ch.phase}
      </div>

      {/* Tag */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 mb-8 relative z-10"
      >
        <span className="w-8 h-px bg-gold" />
        <span className="text-gold text-[11px] font-bold uppercase tracking-[0.4em]">{ch.tag}</span>
        <span className="text-white/15 text-[11px] ml-1">— Step {ch.phase}</span>
      </motion.div>

      {/* Headline — each line staggers in with blur */}
      <div className="relative z-10 mb-8">
        {ch.headline.map((line, li) => (
          <motion.div
            key={`${line}-${li}`}
            initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.15 + li * 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black text-white leading-[0.93] tracking-[-0.04em]"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
          >
            {line}
          </motion.div>
        ))}
      </div>

      {/* Body */}
      <motion.p
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-white/50 text-[1.05rem] leading-[1.85] max-w-md mb-7"
      >
        {ch.body}
      </motion.p>

      {/* "Why us" callout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex items-start gap-3 max-w-md"
      >
        <div className="w-[3px] h-full bg-gold flex-shrink-0 self-stretch min-h-[40px]" />
        <p className="text-gold/70 text-sm leading-relaxed italic">{ch.why}</p>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */
export default function ScrollStorySection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(Math.floor(v * CHAPTERS.length), CHAPTERS.length - 1);
    if (idx !== active) setActive(idx);
  });

  // Progress within the current chapter (0→1)
  const chapterWidth = 1 / CHAPTERS.length;
  const progressInChapter = (p: number) =>
    Math.max(0, Math.min(1, (p - active * chapterWidth) / chapterWidth));

  return (
    /* Outer: provides scroll distance (4 × 100vh) */
    <div ref={outerRef} style={{ height: `${CHAPTERS.length * 100}vh` }} className="relative">

      {/* Sticky viewport panel */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0A0B]">

        {/* ── Background images – all mounted, crossfade via opacity ── */}
        {CHAPTERS.map((ch, i) => (
          <motion.div
            key={ch.phase}
            animate={{ opacity: i === active ? 1 : 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={ch.img}
              alt={ch.tag}
              fill
              className="object-cover"
              priority={i === 0}
              quality={85}
            />
          </motion.div>
        ))}

        {/* Overlay layers */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0A0A0B]/92 via-[#0A0A0B]/70 to-[#0A0A0B]/20" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0A0A0B] via-transparent to-[#0A0A0B]/20" />
        {/* Grain texture */}
        <div
          className="absolute inset-0 z-[2] opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* ── Chapter top label ── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 sm:px-14 lg:px-20 pt-10">
          <div className="flex items-center gap-3">
            <span className="w-6 h-px bg-gold/40" />
            <span className="text-white/25 text-[10px] font-semibold uppercase tracking-[0.4em]">
              The Build Journey
            </span>
          </div>
          {/* Counter */}
          <div className="text-white/20 text-sm tracking-widest font-mono">
            <span className="text-gold font-display font-black text-xl">{String(active + 1).padStart(2, "0")}</span>
            <span className="text-white/20"> / 04</span>
          </div>
        </div>

        {/* ── Chapter text content ── */}
        <div className="relative z-10 h-full">
          <AnimatePresence mode="wait">
            <ChapterContent key={active} ch={CHAPTERS[active]} i={active} />
          </AnimatePresence>
        </div>

        {/* ── Right sidebar: vertical chapter nav ── */}
        <div className="absolute right-10 lg:right-16 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-7">
          {CHAPTERS.map((ch, i) => (
            <motion.div
              key={ch.phase}
              animate={{ opacity: i === active ? 1 : 0.2 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3"
            >
              {/* Active indicator line */}
              <motion.div
                animate={{ height: i === active ? 44 : 16, backgroundColor: i <= active ? "#C9A84C" : "rgba(255,255,255,0.15)" }}
                transition={{ duration: 0.4 }}
                className="w-[2px] rounded-full"
              />
              <div>
                <div className="text-white/30 text-[9px] uppercase tracking-[0.3em]">{ch.phase}</div>
                <div className={`text-[11px] font-medium transition-colors duration-300 ${i === active ? "text-white" : "text-white/25"}`}>
                  {ch.tag}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom progress bar + step dots ── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-8 sm:px-14 lg:px-20 pb-8">
          {/* Step dots */}
          <div className="flex items-center gap-2 mb-4">
            {CHAPTERS.map((ch, i) => (
              <div key={ch.phase} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    width: i === active ? 32 : i < active ? 16 : 10,
                    backgroundColor:
                      i === active ? "#C9A84C" : i < active ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.12)",
                  }}
                  transition={{ duration: 0.4 }}
                  className="h-[2px] rounded-full"
                />
                {i === active && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gold/70 text-[10px] uppercase tracking-[0.3em]"
                  >
                    {ch.tag}
                  </motion.span>
                )}
              </div>
            ))}
          </div>

          {/* Full-width progress bar */}
          <div className="w-full h-px bg-white/[0.07] relative overflow-hidden">
            <motion.div
              animate={{ width: `${((active + 0.5) / CHAPTERS.length) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 left-0 h-full bg-gold"
            />
          </div>

          {/* Scroll hint on first chapter */}
          <AnimatePresence>
            {active === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 text-white/20"
              >
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.4, delay: i * 0.2, repeat: Infinity }}
                      className="w-0.5 h-3 bg-white/30 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em]">Scroll to reveal the story</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CTA that appears on the last chapter ── */}
        <AnimatePresence>
          {active === CHAPTERS.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-28 left-8 sm:left-14 lg:left-20 z-20"
            >
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2.5 bg-gold hover:bg-gold-light text-dark font-black text-[12px] uppercase tracking-[0.25em] px-8 py-3.5 transition-all duration-300 hover:shadow-[0_20px_60px_-10px_rgba(201,168,76,0.5)]"
              >
                Start Your Journey
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

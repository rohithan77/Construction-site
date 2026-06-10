"use client";

import { motion } from "framer-motion";

const ITEMS = [
  "New Home Builds",
  "Duplexes & Dual Occupancy",
  "Knockdown Rebuilds",
  "Granny Flats",
  "Extensions & Renovations",
  "Commercial Construction",
  "Project Management",
  "Design & Approval",
];

function Track({ reverse = false }: { reverse?: boolean }) {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <motion.div
      animate={{ x: reverse ? ["0%", "50%"] : ["0%", "-50%"] }}
      transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      className="flex gap-0 whitespace-nowrap"
    >
      {doubled.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-0 flex-shrink-0"
        >
          <span className="text-white/20 text-sm font-medium tracking-[0.15em] uppercase px-8 py-5">
            {item}
          </span>
          <span className="text-gold/30 text-xs">◆</span>
        </div>
      ))}
    </motion.div>
  );
}

export default function MarqueeSection() {
  return (
    <div className="relative bg-[#07070A] border-y border-white/[0.04] overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#07070A] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#07070A] to-transparent z-10 pointer-events-none" />
      <Track />
    </div>
  );
}

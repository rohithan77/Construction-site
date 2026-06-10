"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { Project } from "@/types";
import { fadeUp, staggerContainer, viewportConfig } from "@/lib/animations";

const PLACEHOLDERS = [
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1800&auto=format&fit=crop&q=80",
];

interface ProjectsSectionProps { projects: Project[] }

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];
  const [active, setActive] = useState("All");

  const featured = projects[0];
  const rest = active === "All" ? projects.slice(1) : projects.filter((p) => p.category === active);
  const filteredAll = active === "All" ? projects.slice(1) : projects.filter((p) => p.category === active);

  return (
    <section className="relative bg-[#111113] overflow-hidden">
      {/* Top rule */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

      {/* ── Full-bleed featured project ─────────────────────────── */}
      {featured && active === "All" && (
        <Link href={`/projects/${featured.slug}`} className="group block relative h-[70vh] min-h-[480px] overflow-hidden">
          {/* Clip-path reveal */}
          <motion.div
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            whileInView={{ clipPath: "inset(0 0% 0 0)" }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={featured.images?.[0] ?? PLACEHOLDERS[0]}
              alt={featured.title}
              fill
              className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
              priority
            />
          </motion.div>

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/90 via-[#0A0A0B]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/40 to-transparent" />

          {/* "Featured" tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute top-8 left-8"
          >
            <span className="bg-gold text-dark text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5">
              Featured Project
            </span>
          </motion.div>

          {/* Bottom content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-0 left-0 right-0 p-8 lg:p-14"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                {featured.category && (
                  <span className="text-gold/70 text-[11px] font-semibold uppercase tracking-[0.3em] mb-3 block">
                    {featured.category}
                  </span>
                )}
                <h2 className="font-display font-black text-[clamp(2rem,5vw,4rem)] text-white leading-[0.95] tracking-[-0.03em] mb-3">
                  {featured.title}
                </h2>
                {featured.location && (
                  <div className="flex items-center gap-1.5 text-white/35 text-sm">
                    <MapPin size={12} />
                    <span>{featured.location}</span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gold flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                  <ArrowUpRight size={22} className="text-dark" />
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      )}

      {/* ── Header + filters ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10"
        >
          <div>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-gold" />
              <span className="text-gold text-[11px] font-semibold uppercase tracking-[0.35em]">Our Portfolio</span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display font-black text-[clamp(2rem,4vw,3rem)] text-white leading-[0.95] tracking-[-0.03em]"
            >
              More Projects We&apos;re{" "}
              <span className="text-gold italic font-bold">Proud Of</span>
            </motion.h2>
          </div>
          <motion.div variants={fadeUp}>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 border border-white/10 hover:border-gold/40 text-white/40 hover:text-gold text-sm font-medium px-5 py-2.5 transition-all duration-300"
            >
              All projects <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeUp}
          className="flex flex-wrap gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                active === cat
                  ? "bg-gold text-dark"
                  : "border border-white/10 text-white/35 hover:border-gold/30 hover:text-white/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </div>

      {/* ── Projects grid ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="wait">
            {filteredAll.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProjectCard project={project} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredAll.length === 0 && (
          <p className="text-center text-white/20 text-sm py-20">No projects found</p>
        )}
      </div>
    </section>
  );
}

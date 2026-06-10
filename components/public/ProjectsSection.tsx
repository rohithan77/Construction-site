"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { Project } from "@/types";
import { fadeUp, staggerContainer, viewportConfig } from "@/lib/animations";

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <section className="relative bg-[#111113] py-28 lg:py-36 overflow-hidden">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="mb-16"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <span className="w-8 h-px bg-gold" />
            <span className="text-gold text-[11px] font-semibold uppercase tracking-[0.35em]">Our Portfolio</span>
          </motion.div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <motion.h2
              variants={fadeUp}
              className="font-display font-bold text-[clamp(2.5rem,4vw,3.5rem)] text-white leading-tight max-w-lg"
            >
              Projects We&apos;re{" "}
              <span className="text-gold italic">Proud Of</span>
            </motion.h2>
            <motion.div variants={fadeUp}>
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 border border-white/10 hover:border-gold/40 text-white/50 hover:text-gold text-sm font-medium px-5 py-2.5 transition-all duration-300"
              >
                View all projects
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeUp}
          className="flex flex-wrap gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                active === cat
                  ? "bg-gold text-dark"
                  : "border border-white/10 text-white/40 hover:border-gold/30 hover:text-white/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="wait">
            {filtered.map((project, i) => (
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

        {projects.length === 0 && (
          <div className="text-center py-20 text-white/20 text-sm">No projects found</div>
        )}
      </div>
    </section>
  );
}

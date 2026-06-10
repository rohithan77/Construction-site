"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home, Building2, Hammer, LayoutGrid, Paintbrush, Building,
} from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Service } from "@/types";
import { fadeUp, scaleIn, staggerContainer, viewportConfig } from "@/lib/animations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICONS: Record<string, React.ComponentType<any>> = {
  Home, Building2, Hammer, LayoutGrid, Paintbrush, Building,
};

const DEFAULT_ICON_NAMES = ["Home", "Building2", "Hammer", "LayoutGrid", "Paintbrush", "Building"];

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section className="relative bg-[#0A0A0B] py-28 lg:py-36 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,168,76,0.04),transparent)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="mb-20"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <span className="w-8 h-px bg-gold" />
            <span className="text-gold text-[11px] font-semibold uppercase tracking-[0.35em]">What We Build</span>
          </motion.div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <motion.h2
              variants={fadeUp}
              className="font-display font-bold text-[clamp(2.5rem,4vw,3.5rem)] text-white leading-tight max-w-md"
            >
              Our Construction{" "}
              <span className="text-gold italic">Services</span>
            </motion.h2>
            <motion.div variants={fadeUp}>
              <Link
                href="/services"
                className="group inline-flex items-center gap-2 text-white/40 hover:text-gold text-sm font-medium transition-colors duration-300"
              >
                View all services
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]"
        >
          {services.map((service, i) => {
            const iconName = DEFAULT_ICON_NAMES[i % DEFAULT_ICON_NAMES.length];
            const Icon = ICONS[iconName] ?? Home;
            const features = service.features
              ? (typeof service.features === "string"
                  ? (service.features as string).split(",").map((f) => f.trim())
                  : (service.features as string[]))
              : [];

            return (
              <motion.div
                key={service.id}
                variants={scaleIn}
                className="group relative bg-[#0A0A0B] p-8 lg:p-10 overflow-hidden cursor-default hover:bg-[#111116] transition-colors duration-500"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/0 group-hover:from-gold/5 group-hover:to-transparent transition-all duration-700" />

                {/* Left border accent on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold/0 group-hover:bg-gold transition-all duration-500" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-7">
                    <div className="w-12 h-12 bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/40 transition-all duration-300">
                      <Icon size={20} className="text-gold" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-xl text-white mb-3 group-hover:text-gold transition-colors duration-300">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/40 text-sm leading-relaxed mb-6 line-clamp-3">
                    {service.description}
                  </p>

                  {/* Features */}
                  {features.slice(0, 3).length > 0 && (
                    <ul className="space-y-2 mb-8">
                      {features.slice(0, 3).map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-white/30 text-[12px]">
                          <span className="w-1 h-1 rounded-full bg-gold/60 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Link */}
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-gold text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
                  >
                    Learn more <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

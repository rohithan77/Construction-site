"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { Project } from "@/types";

const FILTERS = ["All", "Single Storey", "Double Storey", "Duplex", "Granny Flat", "Knockdown Rebuild"];

function firstImage(images: string, fallback: string): string {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr[0] ? arr[0] : fallback;
  } catch {
    return images || fallback;
  }
}

/* Placeholder data typed to minimal safe shape */
type CardItem = {
  id: string;
  title: string;
  slug: string;
  location: string;
  category: string;
  imgSrc: string;
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&auto=format&fit=crop&q=80";

const PLACEHOLDERS: CardItem[] = [
  { id: "p1", title: "Modern Duplex", slug: "#", location: "Castle Hill NSW", category: "Duplex", imgSrc: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&auto=format&fit=crop&q=80" },
  { id: "p2", title: "Custom Family Home", slug: "#", location: "Kellyville NSW", category: "Double Storey", imgSrc: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80" },
  { id: "p3", title: "Knockdown Rebuild", slug: "#", location: "Norwest NSW", category: "Knockdown Rebuild", imgSrc: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80" },
  { id: "p4", title: "Luxury Granny Flat", slug: "#", location: "Baulkham Hills NSW", category: "Granny Flat", imgSrc: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&auto=format&fit=crop&q=80" },
  { id: "p5", title: "Dual Occupancy Development", slug: "#", location: "Rouse Hill NSW", category: "Duplex", imgSrc: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&auto=format&fit=crop&q=80" },
  { id: "p6", title: "Single Storey Contemporary", slug: "#", location: "Winston Hills NSW", category: "Single Storey", imgSrc: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=80" },
  { id: "p7", title: "Multi-Level Family Home", slug: "#", location: "Bella Vista NSW", category: "Double Storey", imgSrc: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80" },
  { id: "p8", title: "Heritage Knockdown Rebuild", slug: "#", location: "Epping NSW", category: "Knockdown Rebuild", imgSrc: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&auto=format&fit=crop&q=80" },
];

function toCard(p: Project): CardItem {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    location: p.location ?? "",
    category: p.category ?? "",
    imgSrc: p.coverImage ?? firstImage(p.images, FALLBACK_IMG),
  };
}

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("All");
  const source: CardItem[] = projects.length > 0 ? projects.map(toCard) : PLACEHOLDERS;

  const filtered =
    active === "All"
      ? source
      : source.filter((p) => p.category === active);

  return (
    <div className="bg-bg pt-[70px]">

      {/* Header */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-text/[0.06]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-7">
            <span className="w-8 h-px bg-accent-secondary" />
            <span className="text-accent-secondary text-[11px] font-semibold uppercase tracking-[0.4em]">Our Portfolio</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <h1 className="font-display font-black text-[clamp(2.6rem,5.5vw,4.5rem)] text-text leading-[0.9] tracking-[-0.04em]">
              500+ homes<br />
              <em className="text-accent-primary not-italic">built across Sydney.</em>
            </h1>
            <p className="text-text/40 text-sm max-w-xs leading-relaxed">
              Every project is different. Browse by type or scroll through the full portfolio.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-surface border-b border-text/[0.06] sticky top-[70px] z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-250 ${
                active === f
                  ? "bg-accent-primary text-white"
                  : "border border-text/12 text-text/42 hover:border-text/25 hover:text-text/65"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/projects/${p.slug}`}
                    className="group block relative overflow-hidden"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <Image
                      src={p.imgSrc}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="project-card-overlay absolute inset-0" />
                    {p.category && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-bg/90 text-text text-[10px] font-semibold uppercase tracking-[0.22em] px-3 py-1.5">
                          {p.category}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h2 className="font-display font-black text-white text-lg leading-tight tracking-[-0.02em] mb-1">
                        {p.title}
                      </h2>
                      {p.location && (
                        <div className="flex items-center gap-1.5 text-white/45 text-xs">
                          <MapPin size={10} />
                          <span>{p.location}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <p className="text-center text-text/30 text-sm py-20">No projects in this category yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

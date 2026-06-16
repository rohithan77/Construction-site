"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MapPin } from "lucide-react";
import { Project } from "@/types";

const blurUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Placeholder cards shown when DB has no projects ─────────── */
const PLACEHOLDERS = [
  { id: "p1", title: "Modern Duplex", location: "Castle Hill NSW", category: "Duplex", img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&auto=format&fit=crop&q=80", slug: "#" },
  { id: "p2", title: "Custom Family Home", location: "Kellyville NSW", category: "Single Storey", img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80", slug: "#" },
  { id: "p3", title: "Knockdown Rebuild", location: "Norwest NSW", category: "Double Storey", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80", slug: "#" },
  { id: "p4", title: "Luxury Granny Flat", location: "Baulkham Hills NSW", category: "Granny Flat", img: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&auto=format&fit=crop&q=80", slug: "#" },
  { id: "p5", title: "Dual Occupancy", location: "Rouse Hill NSW", category: "Duplex", img: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&auto=format&fit=crop&q=80", slug: "#" },
  { id: "p6", title: "Multi-Dwelling Development", location: "Bella Vista NSW", category: "Multi-Dwelling", img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=80", slug: "#" },
];

interface CardData {
  id: string;
  title: string;
  location: string;
  category: string;
  img: string;
  slug: string;
}

function ProjectTile({ item, i }: { item: CardData; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/projects/${item.slug}`}
        className="group block relative overflow-hidden"
        style={{ aspectRatio: i === 0 ? "16/10" : "4/3" }}
      >
        <Image
          src={item.img}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="project-card-overlay absolute inset-0" />

        {/* Category tag */}
        <div className="absolute top-5 left-5">
          <span className="bg-bg/90 text-text text-[10px] font-semibold uppercase tracking-[0.25em] px-3 py-1.5">
            {item.category}
          </span>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-display font-black text-white text-xl leading-tight tracking-[-0.02em] mb-1.5">
            {item.title}
          </h3>
          {item.location && (
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <MapPin size={10} />
              <span>{item.location}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function FeaturedProjectsSection({ projects }: { projects: Project[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 280, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 280, damping: 28 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  function firstImage(images: string): string {
    try {
      const arr = JSON.parse(images);
      return Array.isArray(arr) && arr[0] ? arr[0] : PLACEHOLDERS[0].img;
    } catch {
      return images || PLACEHOLDERS[0].img;
    }
  }

  const display: CardData[] =
    projects.length > 0
      ? projects.slice(0, 6).map((p) => ({
          id: p.id,
          title: p.title,
          location: p.location ?? "",
          category: p.category ?? "",
          img: p.coverImage ?? firstImage(p.images),
          slug: p.slug,
        }))
      : PLACEHOLDERS;

  return (
    <section className="bg-bg py-24 lg:py-32 px-6 sm:px-10 lg:px-16">
      {/* Header — no eyebrow, editorial split */}
      <div className="max-w-[1440px] mx-auto mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black text-[clamp(2rem,5vw,3.8rem)] text-text leading-[0.95] tracking-[-0.03em]"
          >
            Work we&apos;re{" "}
            <span className="text-accent-primary">proud of.</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/projects"
              className="text-text/35 hover:text-accent-primary text-sm font-semibold flex items-center gap-1.5 transition-colors duration-200 shrink-0"
            >
              All projects →
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Grid with custom cursor */}
      <div
        ref={containerRef}
        className="relative max-w-[1440px] mx-auto"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Cursor */}
        <motion.div
          className="pointer-events-none absolute z-50 hidden lg:flex items-center justify-center rounded-full bg-accent-primary"
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{ width: hovering ? 88 : 0, height: hovering ? 88 : 0, opacity: hovering ? 1 : 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="text-white text-[10px] font-bold uppercase tracking-[0.22em]">View</span>
        </motion.div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {display.map((item, i) => (
            <ProjectTile key={item.id} item={item} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

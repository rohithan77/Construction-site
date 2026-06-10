"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";
import { Project } from "@/types";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=75",
];

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const imgSrc = project.images?.[0] ?? PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="relative overflow-hidden bg-[#111116]">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imgSrc}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-gold/90 text-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              {project.category}
            </span>
          </div>

          {/* Status badge */}
          {project.status && (
            <div className="absolute top-4 right-4">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 ${
                project.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-gold/15 text-gold border border-gold/30"
              }`}>
                {project.status}
              </span>
            </div>
          )}

          {/* Arrow icon on hover */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gold flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400">
            <ArrowUpRight size={20} className="text-dark" />
          </div>
        </div>

        {/* Info */}
        <div className="p-6 border border-t-0 border-white/[0.06]">
          <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-gold transition-colors duration-300 line-clamp-1">
            {project.title}
          </h3>
          <p className="text-white/35 text-sm leading-relaxed line-clamp-2 mb-4">{project.description}</p>
          <div className="flex items-center justify-between">
            {project.location && (
              <div className="flex items-center gap-1.5 text-white/25 text-xs">
                <MapPin size={11} />
                <span>{project.location}</span>
              </div>
            )}
            {project.year && (
              <span className="text-white/20 text-xs">{project.year}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

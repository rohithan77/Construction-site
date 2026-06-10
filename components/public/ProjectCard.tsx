import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { Project } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  variant?: "default" | "featured";
}

export default function ProjectCard({ project, variant = "default" }: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    ongoing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    upcoming: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group block relative overflow-hidden rounded-sm bg-dark border border-white/5 hover:border-gold/30 transition-all duration-500",
        variant === "featured" ? "col-span-2 row-span-2" : ""
      )}
    >
      {/* Image */}
      <div className={cn("relative overflow-hidden", variant === "featured" ? "h-80" : "h-56")}>
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-dark-lighter to-dark flex items-center justify-center">
            <div className="text-white/10 font-display font-black text-6xl">B</div>
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 project-card-overlay opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span className={cn("text-xs font-medium px-3 py-1 rounded-sm border backdrop-blur-sm", statusColors[project.status] ?? statusColors.completed)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>

        {/* Category */}
        <div className="absolute top-4 right-4">
          <span className="text-xs font-medium px-3 py-1 rounded-sm border border-white/20 bg-white/5 text-white/70 backdrop-blur-sm">
            {project.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-display font-bold text-white text-lg mb-2 group-hover:text-gold transition-colors duration-300 line-clamp-1">
          {project.title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-4">
          {project.shortDescription}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white/30 text-xs">
            {project.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {project.location}
              </span>
            )}
            {project.year && (
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {project.year}
              </span>
            )}
          </div>

          <span className="flex items-center gap-1 text-gold text-xs font-medium group-hover:gap-2 transition-all duration-300">
            View
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

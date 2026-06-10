"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import ProjectCard from "@/components/public/ProjectCard";
import { Project, PROJECT_CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/projects?published=true")
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); });
  }, []);

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  const filtered = projects.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* Page hero */}
      <section className="bg-dark pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">Portfolio</p>
          <h1 className="font-display font-bold text-5xl sm:text-6xl text-white mb-6">Our Projects</h1>
          <p className="text-white/50 text-lg max-w-xl">
            Every project is a testament to our commitment to quality, precision, and client satisfaction.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-dark-lighter border-y border-white/5 py-6 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-sm border transition-all",
                  activeCategory === cat
                    ? "bg-gold text-dark border-gold"
                    : "bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-dark border border-white/10 focus:border-gold text-white placeholder-white/20 pl-9 pr-4 py-2 text-sm rounded-sm outline-none transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Projects grid */}
      <section className="bg-dark py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 bg-dark-lighter rounded-sm animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="text-white/30 text-sm mb-6">{filtered.length} projects</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-white/30">
              No projects found matching your criteria.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

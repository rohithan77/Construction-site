"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, Star, Award, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
}

export default function HeroSection({
  title = "Building Your Vision,\nDelivering Excellence",
  subtitle = "Premium residential and commercial construction across Greater Sydney. From concept to completion, we build with precision and pride.",
  ctaPrimary = "View Our Projects",
  ctaSecondary = "Get a Quote",
}: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const titleLines = title.split("\n");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-dark">
      {/* Background Image Placeholder */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/hero-bg.jpg')`,
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/70 to-dark/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark/50" />
      </div>

      {/* Geometric accent lines */}
      <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-px h-48 bg-gold/20" />
        <div className="absolute top-20 right-24 w-px h-32 bg-gold/10" />
        <div className="absolute bottom-32 right-16 w-24 h-px bg-gold/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-3xl">
          {/* Badge */}
          <div
            className={cn(
              "inline-flex items-center gap-2 border border-gold/30 bg-gold/10 px-4 py-2 rounded-sm mb-8 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Award size={14} className="text-gold" />
            <span className="text-gold text-xs font-medium tracking-widest uppercase">
              Greater Sydney&apos;s Premier Builder
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight text-white mb-8">
            {titleLines.map((line, i) => (
              <span
                key={i}
                className={cn(
                  "block transition-all duration-700",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                  i === 0 ? "text-white" : "gold-text"
                )}
                style={{ transitionDelay: `${150 + i * 100}ms` }}
              >
                {line}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p
            className={cn(
              "text-white/60 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: "400ms" }}
          >
            {subtitle}
          </p>

          {/* CTAs */}
          <div
            className={cn(
              "flex flex-col sm:flex-row gap-4 mb-16 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: "550ms" }}
          >
            <Link
              href="/projects"
              className="group inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-dark font-bold px-8 py-4 rounded-sm transition-all duration-300 hover:shadow-2xl hover:shadow-gold/30 text-sm uppercase tracking-wider"
            >
              {ctaPrimary}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 border border-white/20 hover:border-gold text-white hover:text-gold font-semibold px-8 py-4 rounded-sm transition-all duration-300 text-sm uppercase tracking-wider"
            >
              {ctaSecondary}
              <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {/* Trust indicators */}
          <div
            className={cn(
              "flex flex-wrap gap-6 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: "700ms" }}
          >
            {[
              { icon: Star, label: "5-Star Rated", sub: "Google Reviews" },
              { icon: Award, label: "Licensed Builder", sub: "NSW & ACT" },
              { icon: Clock, label: "On-Time Delivery", sub: "Guaranteed" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Icon size={14} className="text-gold" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{label}</p>
                  <p className="text-white/40 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={16} />
      </div>
    </section>
  );
}

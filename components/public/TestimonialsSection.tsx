"use client";

import { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Testimonial } from "@/types";
import { cn } from "@/lib/utils";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActive((index + testimonials.length) % testimonials.length);
      setAnimating(false);
    }, 200);
  };

  useEffect(() => {
    const timer = setInterval(() => go(active + 1), 6000);
    return () => clearInterval(timer);
  }, [active]);

  if (!testimonials.length) return null;

  const current = testimonials[active];

  return (
    <section className="bg-dark py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">Testimonials</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-white">
            What Our Clients Say
          </h2>
        </div>

        {/* Testimonial card */}
        <div className="relative">
          <Quote
            size={60}
            className="absolute -top-4 -left-4 text-gold/10 rotate-180"
            aria-hidden="true"
          />

          <div
            className={cn(
              "bg-dark-lighter border border-white/5 rounded-sm p-8 sm:p-12 transition-all duration-200",
              animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}
          >
            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: current.rating }).map((_, i) => (
                <Star key={i} size={16} className="text-gold fill-gold" />
              ))}
            </div>

            <blockquote className="text-white/80 text-lg sm:text-xl leading-relaxed italic font-display mb-8">
              &ldquo;{current.text}&rdquo;
            </blockquote>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-gold font-display font-bold text-lg">
                  {current.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold">{current.name}</p>
                {(current.company || current.role) && (
                  <p className="text-white/40 text-sm">
                    {current.role}
                    {current.role && current.company && " · "}
                    {current.company}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === active ? "w-8 bg-gold" : "w-4 bg-white/20 hover:bg-white/40"
                )}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => go(active - 1)}
              className="w-10 h-10 rounded-sm border border-white/10 hover:border-gold text-white/50 hover:text-gold flex items-center justify-center transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => go(active + 1)}
              className="w-10 h-10 rounded-sm border border-white/10 hover:border-gold text-white/50 hover:text-gold flex items-center justify-center transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

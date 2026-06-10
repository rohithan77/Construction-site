"use client";

import Link from "next/link";
import {
  Home, Building2, Hammer, LayoutGrid, Paintbrush, Building,
  Wrench, Ruler, HardHat, Zap, ArrowRight
} from "lucide-react";
import { Service } from "@/types";
import { parseFeatures } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, React.ComponentType<any>> = {
  home: Home,
  building: Building2,
  hammer: Hammer,
  layout: LayoutGrid,
  paintbrush: Paintbrush,
  buildings: Building,
  wrench: Wrench,
  ruler: Ruler,
  "hard-hat": HardHat,
  zap: Zap,
};

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = iconMap[service.icon ?? "home"] ?? Home;
  const features = parseFeatures(service.features);

  return (
    <div
      className="group relative bg-dark border border-white/5 hover:border-gold/30 rounded-sm p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/10"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className="w-14 h-14 bg-gold/10 border border-gold/20 group-hover:bg-gold/20 group-hover:border-gold/40 rounded-sm flex items-center justify-center mb-6 transition-all duration-300">
        <Icon size={24} className="text-gold" />
      </div>

      {/* Number */}
      <div className="absolute top-6 right-6 text-white/5 font-display font-black text-5xl select-none">
        {String(index + 1).padStart(2, "0")}
      </div>

      <h3 className="text-white font-display font-bold text-xl mb-3 group-hover:text-gold transition-colors duration-300">
        {service.title}
      </h3>

      <p className="text-white/50 text-sm leading-relaxed mb-6 line-clamp-3">
        {service.description}
      </p>

      {features.length > 0 && (
        <ul className="space-y-2 mb-6">
          {features.slice(0, 3).map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-white/40 text-xs">
              <div className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/services#${service.slug}`}
        className="inline-flex items-center gap-2 text-gold text-sm font-medium group/link"
      >
        Learn More
        <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section className="bg-dark-card py-24" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">
            What We Do
          </p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-white mb-6">
            Our Services
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-lg">
            From new home builds to complete renovations — we deliver end-to-end construction solutions tailored to your vision.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 border border-gold/30 hover:border-gold text-gold font-semibold px-8 py-4 rounded-sm transition-all duration-300 hover:bg-gold/10"
          >
            View All Services
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

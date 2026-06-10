import { prisma } from "@/lib/prisma";
import { parseFeatures } from "@/lib/utils";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Home, Building2, Hammer, LayoutGrid, Paintbrush, Building,
  Wrench, Ruler, HardHat, Zap,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description: "Comprehensive construction services including new homes, duplexes, renovations, granny flats and more.",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, React.ComponentType<any>> = {
  home: Home, building: Building2, hammer: Hammer, layout: LayoutGrid,
  paintbrush: Paintbrush, buildings: Building, wrench: Wrench, ruler: Ruler,
  "hard-hat": HardHat, zap: Zap,
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-dark pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">What We Offer</p>
          <h1 className="font-display font-bold text-5xl sm:text-6xl text-white mb-6">Our Services</h1>
          <p className="text-white/50 text-lg max-w-xl">
            End-to-end construction solutions — from initial design to final handover, we manage every detail.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="bg-dark pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon ?? "home"] ?? Home;
            const features = parseFeatures(service.features);
            const isEven = i % 2 === 0;

            return (
              <div
                key={service.id}
                id={service.slug}
                className="group border border-white/5 hover:border-gold/20 rounded-sm overflow-hidden transition-all"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0`}>
                  <div className={`p-10 lg:p-14 ${isEven ? "order-1" : "order-1 lg:order-2"}`}>
                    <div className="w-14 h-14 bg-gold/10 border border-gold/20 rounded-sm flex items-center justify-center mb-6">
                      <Icon size={24} className="text-gold" />
                    </div>
                    <h2 className="font-display font-bold text-3xl text-white mb-4">{service.title}</h2>
                    <p className="text-white/50 leading-relaxed mb-8">{service.description}</p>

                    {features.length > 0 && (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-white/60 text-sm">
                            <CheckCircle size={14} className="text-gold flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      href="/contact"
                      className="group/btn inline-flex items-center gap-2 border border-gold/40 hover:bg-gold hover:border-gold text-gold hover:text-dark font-semibold px-6 py-3 rounded-sm transition-all text-sm"
                    >
                      Enquire About This Service
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className={`bg-dark-lighter flex items-center justify-center p-14 ${isEven ? "order-2" : "order-2 lg:order-1"}`}>
                    <div className="text-center">
                      <div className="text-white/5 font-display font-black text-[120px] leading-none select-none">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="text-gold font-display font-semibold text-xl -mt-4">{service.title}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-4xl text-dark mb-4">Not Sure Which Service You Need?</h2>
          <p className="text-dark/60 text-lg mb-8">Talk to our team and we&apos;ll guide you to the right solution for your project.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-dark text-warm font-bold px-10 py-4 rounded-sm hover:bg-dark-lighter transition-colors text-sm uppercase tracking-wider"
          >
            Free Consultation
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}

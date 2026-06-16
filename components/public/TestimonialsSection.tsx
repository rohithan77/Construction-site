"use client";

import { motion } from "framer-motion";
import { Testimonial } from "@/types";

const FALLBACK: Testimonial[] = [
  {
    id: "t1",
    name: "Sarah & Tom K.",
    role: "New Home Build",
    company: "Castle Hill",
    text: "We'd been through three builders who gave us the same box-plan in different colours. Build Demo spent four sessions just listening before they put pencil to paper. The result is a home that actually fits our family.",
    rating: 5,
    published: true,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t2",
    name: "Michael R.",
    role: "Knockdown Rebuild",
    company: "Kellyville",
    text: "Fixed price meant fixed price. Not a single variation we didn't approve first. That kind of honesty is rare in construction — and it made a genuinely stressful process feel manageable.",
    rating: 5,
    published: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t3",
    name: "Priya & David N.",
    role: "Duplex",
    company: "Norwest",
    text: "The project manager called every Friday at 4pm without us having to chase. When there was an issue with the slab they told us the same day. That communication made everything manageable.",
    rating: 5,
    published: true,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const items = testimonials.length > 0 ? testimonials.slice(0, 3) : FALLBACK;

  return (
    <section className="bg-surface py-28 lg:py-40 px-6 sm:px-10 lg:px-16 overflow-hidden">
      <div className="max-w-[1440px] mx-auto">

        {/* Section label — left-aligned, not centered */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-16 lg:mb-20"
        >
          <span className="w-8 h-px bg-text/20" />
          <span className="text-text/35 text-[10px] font-semibold uppercase tracking-[0.42em]">
            Client voices
          </span>
        </motion.div>

        {/* Editorial testimonial columns — no carousel, no cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-text/[0.08]">
          {items.map((t, i) => (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.75,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="lg:px-10 first:lg:pl-0 last:lg:pr-0 pb-12 lg:pb-0 border-b lg:border-b-0 border-text/[0.08] last:border-b-0"
            >
              {/* Large decorative number */}
              <div
                className="font-display font-black text-text/[0.04] leading-none select-none mb-4"
                style={{ fontSize: "clamp(4rem, 8vw, 6rem)" }}
                aria-hidden
              >
                0{i + 1}
              </div>

              <blockquote className="font-display font-light text-[clamp(1.1rem,1.8vw,1.35rem)] text-text/72 leading-[1.55] tracking-[-0.01em] mb-8 text-pretty">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              <footer className="flex items-start gap-4">
                <div className="w-6 h-px bg-accent-primary mt-3 shrink-0" />
                <div>
                  <p className="text-text font-semibold text-sm">{t.name}</p>
                  {(t.role || t.company) && (
                    <p className="text-text/35 text-xs mt-0.5 tracking-wide">
                      {[t.role, t.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </footer>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

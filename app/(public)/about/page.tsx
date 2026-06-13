import type { Metadata } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet the team behind Build Demo — Sydney's residential construction specialists since 2016.",
};

const VALUES = [
  "We don't start with a catalogue — we start with your family",
  "Fixed-price contracts that actually stay fixed",
  "Every trade on site answers directly to us",
  "Weekly written updates, no chasing required",
  "Open site access any time, any day",
  "5-year structural warranty on every build",
];

const MILESTONES = [
  { year: "2016", event: "First project completed in Kellyville" },
  { year: "2018", event: "Expanded to duplex and multi-dwelling" },
  { year: "2021", event: "200th home delivered" },
  { year: "2024", event: "Team of 50+ specialists, 500+ homes" },
];

const TEAM = [
  { name: "James Thornton", role: "Founder & Lead Builder", years: "30 years experience" },
  { name: "Sophie Marchetti", role: "Head of Design", years: "15 years experience" },
  { name: "David Okafor", role: "Structural Engineer", years: "20 years experience" },
  { name: "Mei Lin", role: "Client Experience Manager", years: "10 years experience" },
];

export default function AboutPage() {
  return (
    <div className="bg-bg pt-[70px]">

      {/* Hero */}
      <section className="py-24 lg:py-36 px-4 sm:px-6 lg:px-8 border-b border-text/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-accent-secondary" />
            <span className="text-accent-secondary text-[11px] font-semibold uppercase tracking-[0.4em]">About Us</span>
          </div>
          <h1 className="font-display font-black text-[clamp(2.8rem,7vw,6rem)] text-text leading-[0.9] tracking-[-0.04em] mb-8">
            Built on honesty.<br />
            <em className="text-accent-primary not-italic">Delivered on time.</em>
          </h1>
          <p className="text-text/50 text-xl leading-relaxed max-w-2xl">
            Build Demo was founded with one conviction: that residential construction in Sydney could be done without the surprises, the excuses, and the extras that come standard with most builders. Eight years and 500 homes later, we still operate that way.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div>
            <h2 className="font-display font-black text-[clamp(2rem,4vw,3.2rem)] text-text leading-[0.95] tracking-[-0.03em] mb-7">
              The honest version of how we got here.
            </h2>
            <p className="text-text/50 leading-[1.9] mb-5">
              Founder James Thornton spent fifteen years working for large residential builders before he stopped being able to defend what he was selling. The plans were designed to be built quickly, not lived in comfortably. The contracts were priced to look competitive, then varied to be profitable. The warranty calls went unreturned.
            </p>
            <p className="text-text/50 leading-[1.9] mb-8">
              Build Demo was his answer: a smaller, more deliberate operation where he could personally stand behind every project. The first five builds were all referrals from the first client. That pattern has held.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2.5 bg-accent-primary text-white font-bold text-[12px] uppercase tracking-[0.22em] px-7 py-4 hover:bg-accent-primary/85 transition-all duration-300">
              Work With Us <ArrowRight size={14} />
            </Link>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {MILESTONES.map(({ year, event }) => (
              <div key={year} className="flex gap-5 items-start">
                <div className="font-display font-black text-accent-primary text-lg leading-none shrink-0 w-16">{year}</div>
                <div className="text-text/55 text-sm leading-relaxed pt-0.5">{event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-accent-secondary" />
            <span className="text-accent-secondary text-[11px] font-semibold uppercase tracking-[0.4em]">How We Work</span>
          </div>
          <h2 className="font-display font-black text-[clamp(2rem,4vw,3rem)] text-text tracking-[-0.03em] mb-12">
            The things that aren&apos;t negotiable.
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-accent-primary mt-0.5 shrink-0" />
                <span className="text-text/55 text-[0.95rem] leading-relaxed">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface border-t border-text/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-accent-secondary" />
            <span className="text-accent-secondary text-[11px] font-semibold uppercase tracking-[0.4em]">The Team</span>
          </div>
          <h2 className="font-display font-black text-[clamp(2rem,4vw,3rem)] text-text tracking-[-0.03em] mb-12">
            The people you&apos;ll actually deal with.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM.map(({ name, role, years }) => (
              <div key={name}>
                <div className="w-full aspect-square bg-bg mb-4" />
                <div className="font-display font-black text-text text-lg leading-tight mb-1">{name}</div>
                <div className="text-accent-primary text-[0.8rem] font-semibold mb-1">{role}</div>
                <div className="text-text/35 text-xs">{years}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description: "New homes, duplexes, knockdown rebuilds, granny flats, multi-dwelling developments and subdivisions across Greater Sydney.",
};

const SERVICES = [
  {
    number: "01",
    title: "New Home Builds",
    tagline: "Custom homes designed around your family, not around the catalogue.",
    description: "We design and build single and double-storey homes from a blank block. Every project starts with a detailed brief — your household's daily rhythms, your neighbourhood's character, the block's specific constraints. The result is a home that couldn't have been built for anyone else.",
    details: ["Fixed-price contracts", "In-house architectural design", "Council submission managed by us", "3D walkthrough before approvals", "Weekly progress updates"],
  },
  {
    number: "02",
    title: "Duplexes & Dual Occupancy",
    tagline: "Two dwellings, one build, maximum return on your block.",
    description: "Duplex development requires careful planning to satisfy council, engineer and financier simultaneously. We've managed enough dual-occupancy builds to understand where most projects come unstuck — and how to avoid those problems before they become expensive.",
    details: ["Feasibility assessment on your block", "Strata title advice", "Simultaneous or staged builds", "Rental yield optimisation", "Fixed-price guaranteed"],
  },
  {
    number: "03",
    title: "Knockdown Rebuilds",
    tagline: "Keep the street you love. Lose the house that doesn't fit.",
    description: "Knockdown rebuild is often the most cost-effective path to a new home in an established suburb. We manage the entire process: council approvals, demolition and asbestos clearance, temporary accommodation advice, and the construction of your new home — all under one fixed-price contract.",
    details: ["Demolition to completion under one contract", "Asbestos and hazardous material management", "Temporary accommodation guidance", "Same council processes as new builds", "Block restaged for final inspection"],
  },
  {
    number: "04",
    title: "Granny Flats & Secondary Dwellings",
    tagline: "Income-generating, family-accommodating, council-compliant.",
    description: "A well-designed granny flat is one of the most versatile additions to a residential property. Whether it's for ageing parents, grown children, or a rental income stream, we deliver compliant secondary dwellings that don't feel like an afterthought.",
    details: ["Compliant with NSW secondary dwelling code", "Can be built while main home is occupied", "Connection to existing services managed by us", "Optional separate metering", "Typically 8–12 week build time"],
  },
  {
    number: "05",
    title: "Multi-Dwelling Developments",
    tagline: "Scale your development without scaling your risk.",
    description: "From terraces to townhouse groups, we project-manage multi-dwelling builds with the same fixed-price rigour we apply to individual homes. Our in-house structural engineers and project managers have navigated enough complex DA processes to take the uncertainty out of higher-density residential development.",
    details: ["Townhouses, terraces and villas", "In-house structural engineering", "DA and CC management", "Investor and owner-occupier configurations", "Staged handover available"],
  },
  {
    number: "06",
    title: "Subdivisions",
    tagline: "Turn one block into an asset-producing portfolio.",
    description: "Subdivision opens up development potential that's already sitting in the land you own. We work with surveyors, engineers and council to assess what your block can yield, then manage the subdivision and development process from start to title registration.",
    details: ["Feasibility and yield assessment", "Surveying and engineering coordination", "Council submission and management", "Build-on option post-subdivision", "Title registration support"],
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-bg pt-[70px]">

      {/* Hero */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 border-b border-text/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-accent-secondary" />
            <span className="text-accent-secondary text-[11px] font-semibold uppercase tracking-[0.4em]">What We Build</span>
          </div>
          <h1 className="font-display font-black text-[clamp(2.8rem,6vw,5.5rem)] text-text leading-[0.9] tracking-[-0.04em] mb-7">
            Six things we build.<br />
            <em className="text-accent-primary not-italic">All of them well.</em>
          </h1>
          <p className="text-text/50 text-lg leading-relaxed max-w-2xl">
            We don&apos;t build everything. We build residential construction in Greater Sydney — and we&apos;ve narrowed our focus enough to be genuinely good at it.
          </p>
        </div>
      </section>

      {/* Services list */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {SERVICES.map((s, i) => (
            <div
              key={s.number}
              className={`py-16 lg:py-20 grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-20 ${
                i < SERVICES.length - 1 ? "border-b border-text/[0.06]" : ""
              }`}
            >
              {/* Left */}
              <div>
                <div className="font-display font-black text-accent-primary text-[3.5rem] leading-none tracking-[-0.05em] mb-3">
                  {s.number}
                </div>
                <h2 className="font-display font-black text-text text-2xl leading-tight tracking-[-0.03em] mb-3">
                  {s.title}
                </h2>
                <p className="text-text/40 text-sm leading-relaxed italic">{s.tagline}</p>
              </div>

              {/* Right */}
              <div>
                <p className="text-text/55 text-[1rem] leading-[1.9] mb-7">{s.description}</p>
                <ul className="space-y-2.5 mb-8">
                  {s.details.map((d) => (
                    <li key={d} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-2 shrink-0" />
                      <span className="text-text/45 text-sm">{d}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-accent-primary font-semibold text-sm hover:gap-3 transition-all duration-200"
                >
                  Discuss this project <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent-primary py-20 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-black text-white text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.03em] mb-5">
            Not sure which service fits your project?
          </h2>
          <p className="text-white/60 mb-8 text-lg">Tell us what you have in mind. We&apos;ll tell you what&apos;s possible.</p>
          <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-accent-primary font-bold text-[12px] uppercase tracking-[0.22em] px-8 py-4">
            Talk to Us <ArrowRight size={14} />
          </Link>
        </div>
      </section>

    </div>
  );
}

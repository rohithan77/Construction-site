import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Process",
  description: "How Build Demo manages every project from the first conversation to your keys — and everything that happens after.",
};

const STAGES = [
  {
    number: "01",
    tag: "Consult",
    heading: "We listen before we measure.",
    duration: "Week 1–2",
    description: "The first meeting has no agenda beyond understanding your project. We want to know what you want to build, what you want to spend, what's worked and hasn't worked in how you currently live, and what your block can realistically support. We don't bring a brochure.",
    outcomes: [
      "Written summary of your brief (sent within 48 hours)",
      "Preliminary feasibility assessment",
      "Honest scope-vs-budget reality check",
      "Introduction to your dedicated project manager",
      "No-obligation quote timeline agreed",
    ],
    honest: "If we don't think we're the right builder for your project, we'll tell you in this meeting — not three months into the DA process.",
  },
  {
    number: "02",
    tag: "Design",
    heading: "Plans that anticipate what others miss.",
    duration: "Week 3–12",
    description: "Our in-house design team produces detailed plans that balance your brief against council requirements, structural constraints, and the practical realities of how rooms are actually used. You'll walk through a complete 3D model before we lodge a single document.",
    outcomes: [
      "Concept designs with your feedback incorporated",
      "3D walkthrough presentation",
      "Structural engineering assessment",
      "Council pre-DA meeting managed by us",
      "Full construction documentation",
    ],
    honest: "Design takes longer than most builders tell you. Anyone promising DA approval in four weeks either hasn't read the local planning controls or is planning to cut corners.",
  },
  {
    number: "03",
    tag: "Build",
    heading: "Every trade on this site answers to us.",
    duration: "Varies by project",
    description: "Construction begins after all approvals are in hand and the fixed-price contract is signed. Your project manager coordinates every subcontractor and reports to you weekly — in writing, with photos, against the programme. Your direct line never goes to a general inbox.",
    outcomes: [
      "Written weekly progress reports",
      "Open site access (no appointment needed)",
      "Same-day notification of any programme impacts",
      "Regular quality inspections logged and shared",
      "Variations (if any) in writing before work starts",
    ],
    honest: "On a 12-month build, something unexpected will happen. The question isn't whether, it's how fast and clearly your builder communicates it. We have a policy: any impact to programme or price is communicated to you the same day we know about it.",
  },
  {
    number: "04",
    tag: "Handover",
    heading: "The house is complete. The relationship isn't.",
    duration: "Final 2 weeks",
    description: "Pre-handover inspection happens with you and your project manager — room by room, item by item. Any defect is documented on the spot and resolved before keys are handed over. You receive a complete home manual, warranty documentation and a direct contact for the life of your warranty period.",
    outcomes: [
      "Defect-free handover (or documented resolution plan)",
      "Complete home maintenance manual",
      "5-year structural warranty",
      "Waterproofing warranty",
      "Dedicated warranty contact (not a hotline)",
    ],
    honest: "The handover inspection takes half a day. Clients who rush it regret it. We don't rush it.",
  },
];

export default function ProcessPage() {
  return (
    <div className="bg-bg pt-[70px]">

      {/* Hero */}
      <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 border-b border-text/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-accent-secondary" />
            <span className="text-accent-secondary text-[11px] font-semibold uppercase tracking-[0.4em]">How We Work</span>
          </div>
          <h1 className="font-display font-black text-[clamp(2.8rem,6vw,5.5rem)] text-text leading-[0.9] tracking-[-0.04em] mb-7">
            The build process,<br />
            <em className="text-accent-primary not-italic">explained honestly.</em>
          </h1>
          <p className="text-text/50 text-lg leading-relaxed max-w-2xl">
            Most builders publish a cheerful four-step diagram. We thought you&apos;d prefer to know what actually happens — including the parts that are genuinely hard.
          </p>
        </div>
      </section>

      {/* Stages */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {STAGES.map((stage, i) => (
            <div
              key={stage.number}
              className={`py-16 lg:py-20 grid lg:grid-cols-[200px_1fr] gap-10 lg:gap-16 ${
                i < STAGES.length - 1 ? "border-b border-text/[0.06]" : ""
              }`}
            >
              {/* Left */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="font-display font-black text-accent-primary text-[3rem] leading-none tracking-[-0.05em] mb-2">
                  {stage.number}
                </div>
                <div className="text-accent-primary text-[11px] font-bold uppercase tracking-[0.4em] mb-3">{stage.tag}</div>
                <div className="text-text/30 text-xs">{stage.duration}</div>
              </div>

              {/* Right */}
              <div>
                <h2 className="font-display font-black text-text text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[0.95] tracking-[-0.03em] mb-6">
                  {stage.heading}
                </h2>
                <p className="text-text/52 text-[1rem] leading-[1.9] mb-8">{stage.description}</p>

                {/* Outcomes */}
                <div className="mb-8">
                  <div className="text-text/30 text-[10px] font-bold uppercase tracking-[0.35em] mb-4">What you get</div>
                  <ul className="space-y-2.5">
                    {stage.outcomes.map((o) => (
                      <li key={o} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-2 shrink-0" />
                        <span className="text-text/50 text-sm leading-relaxed">{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Honest callout */}
                <div className="flex items-start gap-3 p-5 bg-surface">
                  <div className="w-[3px] self-stretch bg-accent-primary shrink-0" />
                  <p className="text-text/55 text-sm leading-relaxed italic">{stage.honest}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent-primary py-20 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-black text-white text-[clamp(2rem,4vw,3.2rem)] tracking-[-0.03em] mb-5">
            Ready to start Stage 01?
          </h2>
          <p className="text-white/60 mb-8 text-lg">The first conversation is free and obligation-free. It&apos;s just a conversation.</p>
          <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-accent-primary font-bold text-[12px] uppercase tracking-[0.22em] px-8 py-4">
            Book a Consult <ArrowRight size={14} />
          </Link>
        </div>
      </section>

    </div>
  );
}

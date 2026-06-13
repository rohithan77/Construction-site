import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ContactCTA() {
  return (
    <section className="bg-accent-primary py-28 lg:py-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-white/55 text-[11px] font-semibold uppercase tracking-[0.4em] mb-7">
          Ready to Build?
        </p>
        <h2 className="font-display font-black text-[clamp(2.4rem,6vw,5rem)] text-white leading-[0.92] tracking-[-0.035em] mb-8">
          Let&apos;s talk about<br />your project.
        </h2>
        <p className="text-white/60 text-lg leading-relaxed max-w-xl mx-auto mb-12">
          No obligation, no generic quote form. Just a straight conversation about what you want to build and whether we&apos;re the right team to build it.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-3 bg-white text-accent-primary font-bold text-[13px] uppercase tracking-[0.22em] px-10 py-5 hover:bg-bg transition-colors duration-300"
        >
          Start a Conversation
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
}

export default function CTASection({
  title = "Ready to Start Building?",
  subtitle = "Let's turn your vision into reality. Get a free consultation today.",
}: CTASectionProps) {
  return (
    <section className="relative bg-dark overflow-hidden py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(201,168,76,0.5) 39px, rgba(201,168,76,0.5) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(201,168,76,0.5) 39px, rgba(201,168,76,0.5) 40px)",
          }}
        />
      </div>

      {/* Gold accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gold text-xs font-medium tracking-widest uppercase mb-6">
          Let&apos;s Work Together
        </p>
        <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
          {title}
        </h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-dark font-bold px-10 py-4 rounded-sm transition-all duration-300 hover:shadow-2xl hover:shadow-gold/30 text-sm uppercase tracking-wider"
          >
            Get a Free Quote
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="tel:+61400000000"
            className="group inline-flex items-center justify-center gap-2 border border-white/20 hover:border-gold text-white hover:text-gold font-semibold px-10 py-4 rounded-sm transition-all duration-300 text-sm uppercase tracking-wider"
          >
            <Phone size={16} />
            Call Us Now
          </a>
        </div>
      </div>
    </section>
  );
}

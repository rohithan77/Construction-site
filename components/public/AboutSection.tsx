"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

const values = [
  "Transparent fixed-price contracts",
  "Licensed & fully insured",
  "Dedicated project manager on every build",
  "Premium materials, no shortcuts",
  "On-time and on-budget delivery",
  "10-year structural warranty",
];

interface AboutSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
}

export default function AboutSection({
  title = "We Build Dreams,\nNot Just Structures",
  subtitle = "A Decade of Trusted Craftsmanship",
  description = "For over a decade, Build Demo has been transforming visions into reality across Greater Sydney. We specialize in bespoke residential and commercial projects — delivering exceptional quality at every stage.\n\nOur commitment to transparency, craftsmanship, and sustainable building practices has made us the trusted choice for families and investors alike.",
  image,
}: AboutSectionProps) {
  const titleLines = title.split("\n");

  return (
    <section className="bg-warm py-24" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="relative h-[500px] lg:h-[600px] rounded-sm overflow-hidden">
              {image ? (
                <Image src={image} alt="About Build Demo" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-lighter to-dark-card flex items-center justify-center">
                  <div className="text-white/5 font-display font-black text-[200px] select-none leading-none">B</div>
                </div>
              )}
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-8 -right-4 lg:-right-8 bg-gold p-6 rounded-sm shadow-2xl">
              <div className="text-dark font-display font-black text-4xl leading-none">10+</div>
              <div className="text-dark/70 text-sm font-medium mt-1">Years of Excellence</div>
            </div>
            {/* Decorative border */}
            <div className="absolute -top-4 -left-4 w-32 h-32 border-2 border-gold/30 rounded-sm pointer-events-none" />
          </div>

          {/* Content side */}
          <div className="lg:pl-8">
            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">
              {subtitle}
            </p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-dark mb-6 leading-tight">
              {titleLines.map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h2>

            <div className="text-dark/60 leading-relaxed mb-8 space-y-4">
              {description.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Values checklist */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {values.map((value) => (
                <li key={value} className="flex items-center gap-3 text-dark/70 text-sm">
                  <CheckCircle size={16} className="text-gold flex-shrink-0" />
                  {value}
                </li>
              ))}
            </ul>

            <Link
              href="/about"
              className="group inline-flex items-center gap-2 bg-dark hover:bg-dark-lighter text-warm font-semibold px-8 py-4 rounded-sm transition-all duration-300 text-sm uppercase tracking-wider"
            >
              Our Story
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* ── Contemporary flat-roof Sydney home elevation ─────────────── */
function HouseSVG({ svgRef }: { svgRef: React.Ref<SVGSVGElement> }) {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 900 520"
      fill="none"
      stroke="var(--color-accent-primary)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
      aria-hidden
    >
      {/* Ground floor full width */}
      <path d="M80,330 L80,500 L820,500 L820,330 Z" />
      {/* Upper floor walls */}
      <path d="M250,180 L250,330 M650,180 L650,330" />
      {/* Flat parapet */}
      <path d="M230,178 L670,178" />
      <path d="M230,178 L230,163 M670,178 L670,163" />
      <path d="M218,161 L682,161" />
      {/* Canopy / floor transition */}
      <path d="M50,330 L850,330" />
      {/* Left section windows */}
      <path d="M100,352 L100,490 L178,490 L178,352 Z" />
      <path d="M188,352 L188,490 L250,490 L250,352 Z" />
      {/* Upper feature window */}
      <path d="M270,195 L270,323 L630,323 L630,195 Z" />
      <path d="M270,260 L630,260" />
      <path d="M360,195 L360,323 M450,195 L450,323 M540,195 L540,323" />
      {/* Entry door */}
      <path d="M370,412 L370,500 L460,500 L460,412 Z" />
      <circle cx="376" cy="458" r="4" />
      {/* Sidelights */}
      <path d="M348,424 L348,470 L368,470 L368,424 Z" />
      <path d="M462,424 L462,470 L482,470 L482,424 Z" />
      {/* Garage */}
      <path d="M638,330 L638,500" />
      <path d="M652,348 L652,498 L808,498 L808,348 Z" />
      <path d="M652,388 L808,388 M652,428 L808,428 M652,464 L808,464" />
      {/* Chimney */}
      <path d="M695,140 L695,180 L728,180 L728,140 Z" />
      <path d="M685,138 L738,138" />
      {/* Ground line */}
      <path d="M20,500 L880,500" />
      {/* Landscaping */}
      <path d="M22,500 Q33,488 44,500 Q55,488 66,500" />
      <path d="M836,500 Q847,488 858,500 Q869,488 880,500" />
    </svg>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Animate SVG drawing on load
    const svgEl = svgRef.current;
    if (svgEl) {
      const elements = Array.from(svgEl.querySelectorAll("path, circle"));
      elements.forEach((el) => {
        const geom = el as SVGGeometryElement;
        if (typeof geom.getTotalLength === "function") {
          const len = geom.getTotalLength();
          gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
        }
      });
      gsap.to(elements, {
        strokeDashoffset: 0,
        duration: 0.7,
        stagger: 0.04,
        ease: "power2.out",
        delay: 0.7,
      });
    }

    // Scroll-scrubbed crossfade: drawing → photo
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
      tl.to(svgWrapRef.current, { opacity: 0, duration: 0.5 }, 0)
        .to(photoRef.current, { opacity: 1, duration: 0.65 }, 0)
        .to(headlineRef.current, { opacity: 0, y: -70, duration: 0.4 }, 0);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{ height: "200vh" }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden bg-bg">

        {/* Photo — hidden until scroll */}
        <div ref={photoRef} className="absolute inset-0 opacity-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&auto=format&fit=crop&q=85"
            alt="Completed contemporary Sydney home"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-text/25" />
        </div>

        {/* SVG drawing */}
        <div
          ref={svgWrapRef}
          className="absolute inset-0 flex items-center justify-center px-8 sm:px-16 lg:px-28"
          style={{ paddingTop: "70px", paddingBottom: "180px" }}
        >
          <div className="w-full max-w-4xl">
            <HouseSVG svgRef={svgRef} />
          </div>
        </div>

        {/* Headline overlay */}
        <div
          ref={headlineRef}
          className="absolute inset-0 flex flex-col justify-end pb-16 sm:pb-20 px-8 sm:px-14 lg:px-20 pointer-events-none"
        >
          <div className="pointer-events-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-5"
            >
              <span className="w-8 h-px bg-accent-secondary" />
              <span className="text-text/45 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.38em]">
                Sydney Residential Construction
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 55, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.1, delay: 1.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-black text-[clamp(2.8rem,7.5vw,6.5rem)] text-text leading-[0.88] tracking-[-0.04em] mb-7"
            >
              Your home,
              <br />
              <em className="text-accent-primary not-italic">precisely</em>
              <br />
              delivered.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 2.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-text/48 text-[1rem] leading-[1.85] max-w-[420px] mb-8"
            >
              New homes, duplexes and knockdown rebuilds for Greater Sydney. Fixed price. No surprises. Since 2016.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-accent-primary hover:bg-accent-primary/85 text-white font-bold text-[12px] uppercase tracking-[0.22em] px-8 py-4 transition-all duration-300 hover:shadow-[0_16px_48px_-10px_rgba(181,105,74,0.45)]"
              >
                Start Your Build
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2.5 border border-text/16 hover:border-text/32 text-text/55 hover:text-text font-semibold text-[12px] uppercase tracking-[0.18em] px-8 py-4 transition-all duration-300"
              >
                View Our Work
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 1 }}
          className="absolute bottom-8 right-8 sm:right-12 flex flex-col items-center gap-2"
        >
          <span
            className="text-text/22 text-[9px] uppercase tracking-[0.4em]"
            style={{ writingMode: "vertical-rl" }}
          >
            Scroll
          </span>
          <div className="w-px h-14 bg-text/10 overflow-hidden mt-2">
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-full h-1/2 bg-accent-primary"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

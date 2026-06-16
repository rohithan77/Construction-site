"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactCTA() {
  return (
    <section className="bg-accent-primary overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-24 lg:py-36">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-14 lg:gap-20">

          {/* Left: headline + CTA */}
          <div className="flex-1 min-w-0">
            <motion.h2
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-black text-white leading-[0.88] tracking-[-0.04em] mb-8 text-wrap-balance"
              style={{ fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)" }}
            >
              Let&apos;s talk about<br />your project.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-white/60 text-[1rem] leading-[1.85] max-w-[400px] mb-10 text-pretty"
            >
              No obligation, no generic quote form. A straight conversation about
              what you want to build and whether we&apos;re the right team to
              build it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 bg-[#1C1B19] hover:bg-[#1C1B19]/85 text-white font-bold text-[12px] uppercase tracking-[0.22em] px-9 py-4.5 transition-all duration-300"
                style={{ paddingTop: "1.1rem", paddingBottom: "1.1rem" }}
              >
                Start a Conversation
                <span className="text-base leading-none">→</span>
              </Link>
            </motion.div>
          </div>

          {/* Right: direct contact block */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 space-y-8 lg:text-right"
          >
            <div>
              <p className="text-white/35 text-[10px] font-semibold uppercase tracking-[0.4em] mb-2">
                Call direct
              </p>
              <a
                href="tel:+61212345678"
                className="text-white text-[1.6rem] font-semibold tracking-[-0.01em] hover:text-white/75 transition-colors duration-200"
              >
                (02) 1234 5678
              </a>
            </div>

            <div>
              <p className="text-white/35 text-[10px] font-semibold uppercase tracking-[0.4em] mb-2">
                Email us
              </p>
              <a
                href="mailto:hello@builddemo.com.au"
                className="text-white/70 text-sm hover:text-white transition-colors duration-200"
              >
                hello@builddemo.com.au
              </a>
            </div>

            <div>
              <p className="text-white/35 text-[10px] font-semibold uppercase tracking-[0.4em] mb-2">
                Response time
              </p>
              <p className="text-white/50 text-sm">Within 1 business day</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

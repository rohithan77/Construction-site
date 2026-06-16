"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function Burger({ open }: { open: boolean }) {
  return (
    <span className="flex flex-col justify-center w-7 h-7 gap-[5px]" aria-hidden>
      <motion.span
        animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="block h-[1.5px] w-6 bg-current origin-center"
      />
      <motion.span
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
        className="block h-[1.5px] w-4 bg-current origin-left"
      />
      <motion.span
        animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="block h-[1.5px] w-6 bg-current origin-center"
      />
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled && !open
            ? "bg-bg/95 backdrop-blur-md border-b border-text/[0.06]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between h-[68px]">

            {/* Wordmark */}
            <Link href="/" className="group flex flex-col leading-none shrink-0 z-10">
              <span className={cn(
                "font-display font-black text-[1.2rem] tracking-[-0.04em] transition-colors duration-300",
                open ? "text-bg group-hover:text-accent-primary" : "text-text group-hover:text-accent-primary"
              )}>
                Build Demo
              </span>
              <span className="text-accent-secondary text-[8px] font-semibold uppercase tracking-[0.45em] mt-0.5">
                Construction
              </span>
            </Link>

            {/* Desktop — links right-aligned only, no centre group */}
            <div className="hidden md:flex items-center gap-7">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative text-[12.5px] font-medium tracking-[0.02em] transition-colors duration-200",
                    pathname === href ? "text-text" : "text-text/45 hover:text-text"
                  )}
                >
                  {label}
                  {pathname === href && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-accent-primary"
                    />
                  )}
                </Link>
              ))}
              <span className="w-px h-4 bg-text/12" />
              <Link
                href="/contact"
                className="text-[12px] font-semibold text-accent-primary hover:text-accent-primary/70 tracking-[0.06em] transition-colors duration-200"
              >
                Get a Quote →
              </Link>
            </div>

            {/* Burger — visible on mobile */}
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className={cn(
                "md:hidden z-10 transition-colors duration-300",
                open ? "text-bg" : "text-text"
              )}
            >
              <Burger open={open} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 bg-text md:hidden flex flex-col"
          >
            {/* Spacer for nav bar height */}
            <div className="h-[68px] border-b border-bg/[0.06] shrink-0" />

            {/* Nav links */}
            <div className="flex-1 flex flex-col justify-center px-8 gap-0 overflow-hidden">
              {NAV.map(({ href, label }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={href}
                    className={cn(
                      "block py-3.5 font-display font-black leading-[1.05] tracking-[-0.04em] transition-colors duration-200",
                      pathname === href ? "text-accent-primary" : "text-bg/75 hover:text-bg"
                    )}
                    style={{ fontSize: "clamp(2.4rem, 9vw, 3.8rem)" }}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="px-8 pb-10 pt-6 border-t border-bg/[0.07] flex flex-col gap-4"
            >
              <Link
                href="/contact"
                className="inline-flex self-start items-center gap-2 bg-accent-primary text-white font-bold text-[11px] uppercase tracking-[0.24em] px-7 py-3.5"
              >
                Start Your Build →
              </Link>
              <a href="tel:+61212345678" className="text-bg/30 text-sm tracking-wide hover:text-bg/60 transition-colors">
                (02) 1234 5678
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

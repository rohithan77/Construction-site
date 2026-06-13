"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-bg/95 backdrop-blur-md border-b border-text/[0.06] shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-[70px]">

            {/* Logo */}
            <Link href="/" className="group flex flex-col leading-none">
              <span className="font-display font-black text-[1.35rem] tracking-[-0.04em] text-text group-hover:text-accent-primary transition-colors duration-300">
                Build Demo
              </span>
              <span className="text-accent-secondary text-[9px] font-semibold uppercase tracking-[0.45em] mt-0.5">
                Construction
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-9">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative text-[13px] font-medium tracking-wide transition-colors duration-200",
                    pathname === href
                      ? "text-accent-primary"
                      : "text-text/55 hover:text-text"
                  )}
                >
                  {label}
                  {pathname === href && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-accent-primary"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="tel:+61400000000"
                className="text-text/35 hover:text-accent-primary text-[12px] font-medium tracking-wide transition-colors duration-200"
              >
                (02) 1234 5678
              </a>
              <Link
                href="/contact"
                className="bg-accent-primary hover:bg-accent-primary/85 text-white font-bold text-[11px] uppercase tracking-[0.22em] px-6 py-3 transition-all duration-300"
              >
                Get a Quote
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-text/70 hover:text-text p-1"
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-bg flex flex-col pt-[70px] md:hidden"
          >
            <div className="flex-1 flex flex-col justify-center px-8 space-y-1">
              {NAV.map(({ href, label }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                >
                  <Link
                    href={href}
                    className={cn(
                      "block py-4 font-display font-black text-4xl transition-colors",
                      pathname === href ? "text-accent-primary" : "text-text/75 hover:text-accent-primary"
                    )}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="px-8 pb-12 border-t border-text/[0.06] pt-8">
              <Link
                href="/contact"
                className="block text-center bg-accent-primary text-white font-bold text-sm uppercase tracking-widest py-4"
              >
                Get a Free Quote
              </Link>
              <a
                href="tel:+61400000000"
                className="block text-center mt-4 text-text/35 text-sm"
              >
                (02) 1234 5678
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

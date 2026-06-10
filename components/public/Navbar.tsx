"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
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
    const handler = () => setScrolled(window.scrollY > 30);
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
            ? "bg-[#0A0A0B]/95 backdrop-blur-md border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 bg-gold flex items-center justify-center group-hover:bg-gold-light transition-colors duration-300">
                  <span className="text-dark font-display font-black text-base leading-none">B</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-[1.5px] border-gold bg-transparent" />
              </div>
              <div>
                <div className="text-white font-display font-bold text-lg leading-none tracking-tight">
                  Build Demo
                </div>
                <div className="text-gold text-[9px] tracking-[0.35em] uppercase leading-none mt-0.5 opacity-70">
                  Construction
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative text-[13px] font-medium tracking-wide transition-colors duration-200",
                    pathname === href ? "text-gold" : "text-white/60 hover:text-white"
                  )}
                >
                  {label}
                  {pathname === href && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-gold"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right CTAs */}
            <div className="hidden md:flex items-center gap-5">
              <a
                href="tel:+61400000000"
                className="flex items-center gap-2 text-white/40 hover:text-gold text-[13px] transition-colors duration-200"
              >
                <Phone size={13} />
                +61 400 000 000
              </a>
              <Link
                href="/contact"
                className="bg-gold hover:bg-gold-light text-dark font-bold text-[12px] uppercase tracking-widest px-5 py-2.5 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(201,168,76,0.6)]"
              >
                Get a Quote
              </Link>
            </div>

            {/* Mobile button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-white/70 hover:text-white p-1 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#0A0A0B] flex flex-col pt-[72px] md:hidden"
          >
            <div className="flex-1 flex flex-col justify-center px-8 space-y-2">
              {NAV.map(({ href, label }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <Link
                    href={href}
                    className={cn(
                      "block py-4 font-display font-bold text-4xl transition-colors duration-200",
                      pathname === href ? "text-gold" : "text-white/80 hover:text-gold"
                    )}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="px-8 pb-12 border-t border-white/5 pt-8 space-y-4">
              <Link
                href="/contact"
                className="block text-center bg-gold text-dark font-bold text-sm uppercase tracking-widest py-4 px-8"
              >
                Get a Free Quote
              </Link>
              <a
                href="tel:+61400000000"
                className="flex items-center justify-center gap-2 text-white/30 text-sm"
              >
                <Phone size={14} />
                +61 400 000 000
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

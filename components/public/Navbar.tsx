"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-dark/95 backdrop-blur-md shadow-lg shadow-black/20"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gold flex items-center justify-center rounded-sm transform group-hover:scale-105 transition-transform">
                  <span className="text-dark font-display font-black text-lg leading-none">B</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-gold bg-transparent rounded-sm"></div>
              </div>
              <div>
                <div className="text-white font-display font-bold text-xl leading-none">
                  Build Demo
                </div>
                <div className="text-gold text-xs tracking-widest uppercase leading-none mt-0.5">
                  Construction
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium tracking-wide relative group",
                    pathname === link.href
                      ? "text-gold"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-0.5 bg-gold transition-all duration-300",
                      pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                    )}
                  />
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="tel:+61400000000"
                className="flex items-center gap-2 text-white/70 hover:text-gold text-sm transition-colors"
              >
                <Phone size={14} />
                <span>+61 400 000 000</span>
              </a>
              <Link
                href="/contact"
                className="bg-gold hover:bg-gold-light text-dark font-semibold text-sm px-6 py-2.5 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
              >
                Get a Quote
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-dark flex flex-col justify-center transition-all duration-500 md:hidden",
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div className="px-8 space-y-6">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ transitionDelay: `${i * 50}ms` }}
              className={cn(
                "block text-3xl font-display font-bold transition-all duration-300",
                isMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0",
                pathname === link.href ? "text-gold" : "text-white hover:text-gold"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div
            className={cn(
              "pt-6 border-t border-white/10 transition-all duration-300",
              isMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
            )}
            style={{ transitionDelay: "300ms" }}
          >
            <Link
              href="/contact"
              className="inline-block bg-gold text-dark font-bold text-lg px-8 py-4 rounded-sm"
            >
              Get a Quote
            </Link>
            <a
              href="tel:+61400000000"
              className="flex items-center gap-2 text-white/60 mt-4"
            >
              <Phone size={16} />
              <span>+61 400 000 000</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

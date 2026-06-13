import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";

const SERVICES = [
  "New Home Builds",
  "Duplexes & Dual Occ.",
  "Knockdown Rebuilds",
  "Granny Flats",
  "Multi-Dwelling",
  "Subdivisions",
];

const LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Our Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Our Process", href: "/process" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-text text-bg/60">
      {/* Top accent */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-accent-primary/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 py-16 lg:py-20">

          {/* Brand */}
          <div>
            <Link href="/" className="group inline-block mb-6">
              <div className="font-display font-black text-xl text-bg group-hover:text-accent-primary transition-colors duration-300 tracking-[-0.03em] leading-none">
                Build Demo
              </div>
              <div className="text-accent-secondary text-[9px] font-semibold uppercase tracking-[0.4em] mt-1">
                Construction
              </div>
            </Link>
            <p className="text-bg/30 text-sm leading-relaxed mb-6 max-w-[210px]">
              Greater Sydney&apos;s residential construction specialists since 2016.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Facebook, label: "Facebook" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 border border-bg/10 hover:border-accent-primary/50 flex items-center justify-center text-bg/25 hover:text-accent-primary transition-all duration-300"
                >
                  <Icon size={13} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-bg/45 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Services</h4>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s}>
                  <Link href="/services" className="text-bg/28 hover:text-accent-primary text-sm transition-colors duration-200">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-bg/45 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-bg/28 hover:text-accent-primary text-sm transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-bg/45 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Get in Touch</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:+6102123456789" className="flex items-start gap-3 text-bg/28 hover:text-accent-primary transition-colors text-sm group">
                  <Phone size={13} className="mt-0.5 shrink-0" />
                  (02) 1234 5678
                </a>
              </li>
              <li>
                <a href="mailto:hello@builddemo.com.au" className="flex items-start gap-3 text-bg/28 hover:text-accent-primary transition-colors text-sm group">
                  <Mail size={13} className="mt-0.5 shrink-0" />
                  hello@builddemo.com.au
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-bg/28 text-sm">
                  <MapPin size={13} className="mt-0.5 shrink-0" />
                  <span>Level 4, 100 Harris Street<br />Pyrmont NSW 2009</span>
                </div>
              </li>
            </ul>
            <div className="mt-8">
              <Link href="/contact" className="inline-block bg-accent-primary hover:bg-accent-primary/85 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 transition-all duration-300">
                Get a Quote
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-bg/[0.06] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-bg/18 text-xs">
            © {new Date().getFullYear()} Build Demo Pty Ltd. All rights reserved. NSW Builder Licence #123456.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <Link key={item} href="#" className="text-bg/18 hover:text-bg/45 text-xs transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

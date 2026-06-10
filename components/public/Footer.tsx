import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin, ArrowUpRight } from "lucide-react";

const services = [
  { label: "New Home Builds", href: "/services" },
  { label: "Duplexes & Dual Occ.", href: "/services" },
  { label: "Knockdown Rebuilds", href: "/services" },
  { label: "Granny Flats", href: "/services" },
  { label: "Renovations", href: "/services" },
  { label: "Commercial", href: "/services" },
];

const links = [
  { label: "About Us", href: "/about" },
  { label: "Our Projects", href: "/projects" },
  { label: "Our Services", href: "/services" },
  { label: "Contact", href: "/contact" },
  { label: "Admin Login", href: "/admin/login" },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#07070A] border-t border-white/[0.04]">
      {/* Top gold line */}
      <div className="h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 py-16 lg:py-20">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gold flex items-center justify-center group-hover:bg-gold-light transition-colors duration-300">
                  <span className="text-dark font-display font-black text-lg leading-none">B</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-gold bg-transparent" />
              </div>
              <div>
                <div className="text-white font-display font-bold text-xl leading-none">Build Demo</div>
                <div className="text-gold text-[10px] tracking-[0.3em] uppercase leading-none mt-1">Construction</div>
              </div>
            </Link>

            <p className="text-white/25 text-sm leading-relaxed mb-6 max-w-[220px]">
              Greater Sydney&apos;s premium construction company since 1999.
            </p>

            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 border border-white/10 hover:border-gold/40 flex items-center justify-center text-white/25 hover:text-gold transition-all duration-300"
                >
                  <Icon size={13} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Services</h4>
            <ul className="space-y-3">
              {services.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-white/30 hover:text-gold text-sm transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {label}
                    <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-white/30 hover:text-gold text-sm transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    {label}
                    <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Get in Touch</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+61400000000"
                  className="flex items-start gap-3 text-white/30 hover:text-gold transition-colors duration-200 text-sm group"
                >
                  <Phone size={13} className="mt-0.5 flex-shrink-0 group-hover:text-gold" />
                  +61 400 000 000
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@builddemo.com.au"
                  className="flex items-start gap-3 text-white/30 hover:text-gold transition-colors duration-200 text-sm group"
                >
                  <Mail size={13} className="mt-0.5 flex-shrink-0 group-hover:text-gold" />
                  hello@builddemo.com.au
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-white/30 text-sm">
                  <MapPin size={13} className="mt-0.5 flex-shrink-0" />
                  <span>Level 4, 100 Harris Street<br />Pyrmont NSW 2009</span>
                </div>
              </li>
            </ul>

            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-dark text-xs font-bold uppercase tracking-widest px-5 py-3 transition-all duration-300"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/15 text-xs">
            © {new Date().getFullYear()} Build Demo Pty Ltd. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-white/15 hover:text-white/40 text-xs transition-colors duration-200"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";

const services = [
  { label: "New Home Builds", href: "/services#new-home-builds" },
  { label: "Duplex Construction", href: "/services#duplex-construction" },
  { label: "Knockdown Rebuild", href: "/services#knockdown-rebuild" },
  { label: "Granny Flats", href: "/services#granny-flats" },
  { label: "Renovations", href: "/services#renovations" },
  { label: "Multi-Dwelling", href: "/services#multi-dwelling" },
];

const quickLinks = [
  { label: "Our Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      {/* Top border accent */}
      <div className="h-1 bg-gold-gradient" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gold flex items-center justify-center rounded-sm">
                  <span className="text-dark font-display font-black text-lg leading-none">B</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-gold bg-transparent rounded-sm"></div>
              </div>
              <div>
                <div className="text-white font-display font-bold text-xl leading-none">Build Demo</div>
                <div className="text-gold text-xs tracking-widest uppercase leading-none mt-0.5">Construction</div>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Building dreams across Greater Sydney. Premium residential and commercial construction with a decade of trusted craftsmanship.
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
                  className="w-9 h-9 border border-white/10 hover:border-gold hover:text-gold flex items-center justify-center rounded-sm transition-all duration-300 text-white/50"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-gold font-display font-semibold text-sm tracking-widest uppercase mb-6">
              Services
            </h4>
            <ul className="space-y-3">
              {services.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/50 hover:text-gold text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-4 h-px bg-white/20 group-hover:bg-gold group-hover:w-6 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold font-display font-semibold text-sm tracking-widest uppercase mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/50 hover:text-gold text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-4 h-px bg-white/20 group-hover:bg-gold group-hover:w-6 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold font-display font-semibold text-sm tracking-widest uppercase mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+61400000000"
                  className="flex items-start gap-3 text-white/50 hover:text-gold transition-colors group"
                >
                  <Phone size={16} className="mt-0.5 shrink-0 group-hover:text-gold" />
                  <span className="text-sm">+61 400 000 000</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@builddemo.com.au"
                  className="flex items-start gap-3 text-white/50 hover:text-gold transition-colors group"
                >
                  <Mail size={16} className="mt-0.5 shrink-0 group-hover:text-gold" />
                  <span className="text-sm">info@builddemo.com.au</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/50">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span className="text-sm">Sydney, New South Wales, Australia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Build Demo. All rights reserved. ABN: XX XXX XXX XXX
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/30 hover:text-gold text-xs transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/30 hover:text-gold text-xs transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

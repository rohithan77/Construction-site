import Link from "next/link";

const LINKS = [
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1C1B19] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-20 lg:pt-28 pb-10">

        {/* Main editorial block */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-14 lg:gap-20 pb-16 border-b border-[#F7F4ED]/[0.06]">

          {/* Large typographic CTA */}
          <div className="flex-1 min-w-0">
            <p className="text-[#F7F4ED]/22 text-[10px] font-semibold uppercase tracking-[0.45em] mb-7">
              Ready to begin
            </p>
            <h2
              className="font-display font-black text-[#F7F4ED] leading-[0.87] tracking-[-0.04em] text-wrap-balance"
              style={{ fontSize: "clamp(3.2rem, 8.5vw, 7.5rem)" }}
            >
              Let&apos;s build<br />
              something<br />
              <span className="text-accent-primary">worth keeping.</span>
            </h2>

            <div className="mt-10">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 border border-[#F7F4ED]/18 hover:border-accent-primary text-[#F7F4ED]/60 hover:text-accent-primary text-[12px] font-bold uppercase tracking-[0.22em] px-8 py-4 transition-all duration-300"
              >
                Start a Conversation
                <span className="text-lg leading-none">→</span>
              </Link>
            </div>
          </div>

          {/* Contact details column */}
          <div className="lg:max-w-[280px] space-y-9 shrink-0">
            <div>
              <p className="text-[#F7F4ED]/22 text-[10px] font-semibold uppercase tracking-[0.35em] mb-2.5">Call</p>
              <a
                href="tel:+61212345678"
                className="text-[#F7F4ED]/65 hover:text-accent-primary text-[1.25rem] font-semibold tracking-[-0.01em] transition-colors duration-200"
              >
                (02) 1234 5678
              </a>
            </div>

            <div>
              <p className="text-[#F7F4ED]/22 text-[10px] font-semibold uppercase tracking-[0.35em] mb-2.5">Email</p>
              <a
                href="mailto:hello@builddemo.com.au"
                className="text-[#F7F4ED]/50 hover:text-accent-primary text-sm transition-colors duration-200"
              >
                hello@builddemo.com.au
              </a>
            </div>

            <div>
              <p className="text-[#F7F4ED]/22 text-[10px] font-semibold uppercase tracking-[0.35em] mb-2.5">Office</p>
              <p className="text-[#F7F4ED]/40 text-sm leading-relaxed">
                Level 4, 100 Harris Street<br />
                Pyrmont NSW 2009
              </p>
            </div>

            <div>
              <p className="text-[#F7F4ED]/22 text-[10px] font-semibold uppercase tracking-[0.35em] mb-2.5">Licence</p>
              <p className="text-[#F7F4ED]/30 text-xs">NSW Builder Lic. #123456</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[#F7F4ED]/18 text-xs">
            © {new Date().getFullYear()} Build Demo Pty Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-5">
            {LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[#F7F4ED]/18 hover:text-[#F7F4ED]/45 text-xs transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

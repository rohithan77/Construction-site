import ContactSection from "@/components/public/ContactSection";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Build Demo. Free consultations for new home builds, renovations, duplexes and more.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-dark pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">Reach Out</p>
          <h1 className="font-display font-bold text-5xl sm:text-6xl text-white mb-6">Get In Touch</h1>
          <p className="text-white/50 text-lg max-w-xl">
            Have a project in mind? We&apos;d love to hear about it. Contact us for a free, no-obligation consultation.
          </p>
        </div>
      </section>

      {/* Info bar */}
      <section className="bg-dark-lighter border-y border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Phone, label: "Phone", value: "+61 400 000 000", href: "tel:+61400000000" },
              { icon: Mail, label: "Email", value: "info@builddemo.com.au", href: "mailto:info@builddemo.com.au" },
              { icon: MapPin, label: "Location", value: "Sydney, NSW, Australia", href: null },
              { icon: Clock, label: "Hours", value: "Mon–Fri: 8am–6pm", href: null },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-gold" />
                </div>
                <div>
                  <p className="text-white/30 text-xs">{label}</p>
                  {href ? (
                    <a href={href} className="text-white text-sm hover:text-gold transition-colors">{value}</a>
                  ) : (
                    <p className="text-white text-sm">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  );
}

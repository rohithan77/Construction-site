"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import type { Metadata } from "next";
import toast from "react-hot-toast";

const PROJECT_TYPES = [
  "New Home Build",
  "Duplex / Dual Occupancy",
  "Knockdown Rebuild",
  "Granny Flat",
  "Multi-Dwelling Development",
  "Subdivision",
  "Not sure yet",
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Message sent — we'll be in touch within one business day.");
        setForm({ name: "", email: "", phone: "", projectType: "", message: "" });
      } else {
        throw new Error("Failed");
      }
    } catch {
      toast.error("Something went wrong. Please try calling us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg pt-[70px]">

      {/* Hero */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-text/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-7">
            <span className="w-8 h-px bg-accent-secondary" />
            <span className="text-accent-secondary text-[11px] font-semibold uppercase tracking-[0.4em]">Contact Us</span>
          </div>
          <h1 className="font-display font-black text-[clamp(2.6rem,6vw,5rem)] text-text leading-[0.9] tracking-[-0.04em]">
            Let&apos;s talk about<br />
            <em className="text-accent-primary not-italic">your project.</em>
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_420px] gap-16 lg:gap-20">

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-text/50 text-xs font-semibold uppercase tracking-[0.28em] mb-2">
                  Name *
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="w-full bg-surface border border-text/[0.09] focus:border-accent-primary text-text placeholder-text/25 px-4 py-3.5 text-sm outline-none transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-text/50 text-xs font-semibold uppercase tracking-[0.28em] mb-2">
                  Email *
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@email.com"
                  className="w-full bg-surface border border-text/[0.09] focus:border-accent-primary text-text placeholder-text/25 px-4 py-3.5 text-sm outline-none transition-colors duration-200"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-text/50 text-xs font-semibold uppercase tracking-[0.28em] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="04XX XXX XXX"
                  className="w-full bg-surface border border-text/[0.09] focus:border-accent-primary text-text placeholder-text/25 px-4 py-3.5 text-sm outline-none transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-text/50 text-xs font-semibold uppercase tracking-[0.28em] mb-2">
                  Project Type
                </label>
                <select
                  value={form.projectType}
                  onChange={(e) => setForm((f) => ({ ...f, projectType: e.target.value }))}
                  className="w-full bg-surface border border-text/[0.09] focus:border-accent-primary text-text px-4 py-3.5 text-sm outline-none transition-colors duration-200 appearance-none"
                >
                  <option value="">Select type...</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-text/50 text-xs font-semibold uppercase tracking-[0.28em] mb-2">
                Tell us about your project *
              </label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Where's the block, what are you thinking of building, any timeline constraints..."
                className="w-full bg-surface border border-text/[0.09] focus:border-accent-primary text-text placeholder-text/25 px-4 py-3.5 text-sm outline-none resize-none transition-colors duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-accent-primary hover:bg-accent-primary/85 disabled:opacity-60 text-white font-bold text-[12px] uppercase tracking-[0.22em] px-10 py-4 transition-all duration-300"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

            <p className="text-text/30 text-xs leading-relaxed">
              We respond to every enquiry within one business day. If you prefer to talk, call us directly on (02) 1234 5678.
            </p>
          </form>

          {/* Info panel */}
          <div>
            <div className="bg-surface p-8 mb-6">
              <h3 className="font-display font-black text-text text-lg mb-6 tracking-[-0.02em]">
                Get in touch directly
              </h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <Phone size={15} className="text-accent-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-text text-sm font-medium">(02) 1234 5678</div>
                    <div className="text-text/35 text-xs mt-0.5">Mon–Fri, 8am–5pm AEST</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Mail size={15} className="text-accent-primary mt-0.5 shrink-0" />
                  <div>
                    <a href="mailto:hello@builddemo.com.au" className="text-text text-sm font-medium hover:text-accent-primary transition-colors">
                      hello@builddemo.com.au
                    </a>
                    <div className="text-text/35 text-xs mt-0.5">Response within 1 business day</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <MapPin size={15} className="text-accent-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-text text-sm font-medium">Level 4, 100 Harris Street</div>
                    <div className="text-text/35 text-xs mt-0.5">Pyrmont NSW 2009</div>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Clock size={15} className="text-accent-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="text-text text-sm font-medium">Mon–Fri: 8am–5pm</div>
                    <div className="text-text/35 text-xs mt-0.5">Saturday by appointment</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-6 border border-text/[0.08]">
              <p className="text-text/50 text-sm leading-relaxed">
                <strong className="text-text">Not ready to commit?</strong> A consult is just a conversation. We&apos;ll tell you honestly whether your project is feasible, roughly what it might cost, and whether we&apos;re the right builder for it. No obligation.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Phone, Mail, MapPin, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const services = [
  "New Home Build",
  "Duplex Construction",
  "Knockdown Rebuild",
  "Granny Flat",
  "Renovation",
  "Multi-Dwelling",
  "Other",
];

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
      reset();
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <section className="bg-dark py-24" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">
              Get In Touch
            </p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white mb-6">
              Let&apos;s Build Something Great Together
            </h2>
            <p className="text-white/50 leading-relaxed mb-10">
              Ready to start your project? Contact us for a free, no-obligation consultation. Our team will get back to you within 24 hours.
            </p>

            <div className="space-y-6">
              {[
                { icon: Phone, label: "Phone", value: "+61 400 000 000", href: "tel:+61400000000" },
                { icon: Mail, label: "Email", value: "info@builddemo.com.au", href: "mailto:info@builddemo.com.au" },
                { icon: MapPin, label: "Location", value: "Sydney, New South Wales, Australia", href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-white hover:text-gold transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-white">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-dark-lighter border border-white/5 rounded-sm p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={32} className="text-gold" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white mb-3">
                  Message Sent!
                </h3>
                <p className="text-white/50">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-gold text-sm hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      {...register("name")}
                      placeholder="John Smith"
                      className="w-full bg-dark border border-white/10 focus:border-gold text-white placeholder-white/20 rounded-sm px-4 py-3 text-sm outline-none transition-colors"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">
                      Email *
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="john@example.com"
                      className="w-full bg-dark border border-white/10 focus:border-gold text-white placeholder-white/20 rounded-sm px-4 py-3 text-sm outline-none transition-colors"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">
                      Phone
                    </label>
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="+61 400 000 000"
                      className="w-full bg-dark border border-white/10 focus:border-gold text-white placeholder-white/20 rounded-sm px-4 py-3 text-sm outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">
                      Service
                    </label>
                    <select
                      {...register("service")}
                      className="w-full bg-dark border border-white/10 focus:border-gold text-white rounded-sm px-4 py-3 text-sm outline-none transition-colors"
                    >
                      <option value="">Select a service</option>
                      {services.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">
                    Message *
                  </label>
                  <textarea
                    {...register("message")}
                    rows={5}
                    placeholder="Tell us about your project..."
                    className="w-full bg-dark border border-white/10 focus:border-gold text-white placeholder-white/20 rounded-sm px-4 py-3 text-sm outline-none transition-colors resize-none"
                  />
                  {errors.message && (
                    <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-dark font-bold py-4 rounded-sm transition-all duration-300 text-sm uppercase tracking-wider"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

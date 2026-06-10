"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Send, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { fadeUp, slideInLeft, slideInRight, staggerContainer, viewportConfig } from "@/lib/animations";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const SERVICES = [
  "New Home Build", "Duplex Construction", "Knockdown Rebuild",
  "Granny Flat", "Renovation", "Multi-Dwelling", "Other",
];

const inputCls =
  "w-full bg-white/[0.03] border border-white/10 focus:border-gold text-white placeholder-white/20 px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:bg-white/[0.05]";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      reset();
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <section className="relative bg-[#07070A] py-28 lg:py-36 overflow-hidden" id="contact">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* ── Left: Info ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-gold" />
              <span className="text-gold text-[11px] font-semibold uppercase tracking-[0.35em]">Start Your Project</span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-display font-bold text-[clamp(2.5rem,4vw,3.5rem)] text-white leading-tight mb-6"
            >
              Let&apos;s Build Something{" "}
              <span className="text-gold italic">Extraordinary</span>
            </motion.h2>

            <motion.p variants={fadeUp} className="text-white/35 text-base leading-[1.9] mb-12 max-w-sm">
              Free, no-obligation consultation. We&apos;ll listen to your vision and provide honest advice about what&apos;s possible within your budget and timeframe.
            </motion.p>

            <motion.div variants={staggerContainer} className="space-y-6">
              {[
                { Icon: Phone, label: "Call us", value: "+61 400 000 000", href: "tel:+61400000000" },
                { Icon: Mail, label: "Email us", value: "hello@builddemo.com.au", href: "mailto:hello@builddemo.com.au" },
                { Icon: MapPin, label: "Find us", value: "Level 4, 100 Harris Street, Pyrmont NSW 2009", href: null },
              ].map(({ Icon, label, value, href }) => (
                <motion.div key={label} variants={fadeUp} className="flex items-start gap-5 group">
                  <div className="w-11 h-11 bg-gold/8 border border-gold/15 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/15 group-hover:border-gold/30 transition-all duration-300">
                    <Icon size={16} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white/25 text-[10px] uppercase tracking-[0.25em] mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="text-white/70 hover:text-gold text-sm transition-colors duration-200">{value}</a>
                    ) : (
                      <p className="text-white/50 text-sm leading-relaxed">{value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Form ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={slideInRight}
          >
            <div className="border border-white/[0.07] bg-white/[0.02] p-8 lg:p-10">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 bg-gold/10 border border-gold/25 flex items-center justify-center mb-6">
                    <CheckCircle2 size={28} className="text-gold" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white mb-3">Message Received</h3>
                  <p className="text-white/35 text-sm max-w-xs leading-relaxed">
                    Thank you for reaching out. A member of our team will contact you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-gold text-xs hover:underline uppercase tracking-widest"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-white/30 text-[10px] uppercase tracking-[0.25em] mb-2">Full Name *</label>
                      <input {...register("name")} placeholder="John Smith" className={inputCls} />
                      {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-white/30 text-[10px] uppercase tracking-[0.25em] mb-2">Email *</label>
                      <input {...register("email")} type="email" placeholder="john@example.com" className={inputCls} />
                      {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-white/30 text-[10px] uppercase tracking-[0.25em] mb-2">Phone</label>
                      <input {...register("phone")} type="tel" placeholder="+61 400 000 000" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-white/30 text-[10px] uppercase tracking-[0.25em] mb-2">Service</label>
                      <select {...register("service")} className={inputCls + " bg-[#0A0A0B]"}>
                        <option value="">Select a service</option>
                        {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/30 text-[10px] uppercase tracking-[0.25em] mb-2">Message *</label>
                    <textarea
                      {...register("message")}
                      rows={5}
                      placeholder="Tell us about your project..."
                      className={inputCls + " resize-none"}
                    />
                    {errors.message && <p className="text-red-400 text-xs mt-1.5">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2.5 bg-gold hover:bg-gold-light disabled:opacity-50 text-dark font-black text-[13px] uppercase tracking-[0.2em] py-4 transition-all duration-300 hover:shadow-[0_20px_60px_-10px_rgba(201,168,76,0.4)]"
                  >
                    {isSubmitting ? "Sending…" : "Send Message"}
                    <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

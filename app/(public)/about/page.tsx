import { prisma } from "@/lib/prisma";
import { CheckCircle, Award, Users, Clock, Shield } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Build Demo — a decade of trusted construction craftsmanship across Greater Sydney.",
};

const team = [
  { name: "James Mitchell", role: "Founder & CEO", bio: "20 years in residential construction across Sydney." },
  { name: "Sarah Williams", role: "Head of Design", bio: "Award-winning designer specialising in modern Australian homes." },
  { name: "David Chen", role: "Project Director", bio: "Expert in large-scale duplex and multi-dwelling developments." },
  { name: "Emma Thompson", role: "Client Relations", bio: "Dedicated to ensuring every client has a seamless build experience." },
];

const values = [
  { icon: Award, title: "Uncompromising Quality", desc: "We use only premium materials and work with the best tradespeople in the industry." },
  { icon: Shield, title: "Transparent Process", desc: "Fixed-price contracts, regular updates, and no hidden surprises — ever." },
  { icon: Users, title: "Client Partnership", desc: "We listen, advise, and collaborate to bring your specific vision to life." },
  { icon: Clock, title: "On-Time Delivery", desc: "We respect your time. Our project management ensures delivery on schedule." },
];

export default async function AboutPage() {
  const contentItems = await prisma.siteContent.findMany();
  const content: Record<string, string> = {};
  contentItems.forEach((item) => { content[item.key] = item.value; });

  return (
    <>
      {/* Hero */}
      <section className="bg-dark pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">Who We Are</p>
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white mb-8 leading-tight">
              Building Sydney&apos;s<br />
              <span className="gold-text">Best Homes</span>
            </h1>
            <p className="text-white/50 text-xl leading-relaxed">
              For over a decade, Build Demo has been the trusted name in premium residential construction across Greater Sydney.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gold py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: content.stat_years ?? "10+", label: "Years Experience" },
              { value: content.stat_projects ?? "250+", label: "Projects Completed" },
              { value: content.stat_clients ?? "200+", label: "Happy Clients" },
              { value: content.stat_team ?? "50+", label: "Team Members" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-black text-5xl text-dark mb-1">{stat.value}</div>
                <div className="text-dark/60 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-warm py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">Our Story</p>
              <h2 className="font-display font-bold text-4xl text-dark mb-6">
                {content.about_title?.split("\n")[0] ?? "We Build Dreams"}
              </h2>
              <div className="text-dark/60 leading-relaxed space-y-4">
                {(content.about_description ?? "").split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-5 bg-white rounded-sm border border-warm-dark hover:border-gold/30 transition-colors group">
                  <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-sm flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                    <Icon size={18} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark mb-1">{title}</h3>
                    <p className="text-dark/50 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-dark py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">The People</p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="group bg-dark-lighter border border-white/5 hover:border-gold/30 rounded-sm p-6 text-center transition-all">
                <div className="w-20 h-20 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-gold font-display font-black text-3xl">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">{member.name}</h3>
                <p className="text-gold text-xs mb-3">{member.role}</p>
                <p className="text-white/40 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-dark-lighter border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/30 text-xs uppercase tracking-widest mb-8">Licensed & Certified</p>
          <div className="flex flex-wrap justify-center gap-12">
            {["NSW Licensed Builder", "HIA Member", "Master Builders Association", "HBCF Insured", "ISO 9001 Certified"].map((cert) => (
              <div key={cert} className="flex items-center gap-2 text-white/40 text-sm">
                <CheckCircle size={14} className="text-gold" />
                {cert}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-4xl text-white mb-6">Ready to Build With Us?</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-dark font-bold px-10 py-4 rounded-sm transition-all text-sm uppercase tracking-wider">
            Get a Free Consultation
          </Link>
        </div>
      </section>
    </>
  );
}

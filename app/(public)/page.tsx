export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/public/HeroSection";
import PhilosophySection from "@/components/public/PhilosophySection";
import FeaturedProjectsSection from "@/components/public/FeaturedProjectsSection";
import ProcessSection from "@/components/public/ProcessSection";
import StatsBand from "@/components/public/StatsBand";
import TestimonialsSection from "@/components/public/TestimonialsSection";
import ContactCTA from "@/components/public/ContactCTA";

async function getHomeData() {
  const [projects, testimonials] = await Promise.all([
    prisma.project.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }],
      take: 6,
    }),
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
  ]);
  return { projects, testimonials };
}

export default async function HomePage() {
  const { projects, testimonials } = await getHomeData();

  return (
    <>
      {/* 1. Signature SVG → photo morph hero */}
      <HeroSection />

      {/* 2. Philosophy statement */}
      <PhilosophySection />

      {/* 3. Featured projects grid with custom cursor */}
      <FeaturedProjectsSection projects={projects} />

      {/* 4. Scroll-driven build journey (sticky 4 stages) */}
      <ProcessSection />

      {/* 5. Stats band */}
      <StatsBand />

      {/* 6. Client testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 7. Contact CTA */}
      <ContactCTA />
    </>
  );
}

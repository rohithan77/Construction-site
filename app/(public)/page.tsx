export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import HeroSection from "@/components/public/HeroSection";
import MarqueeSection from "@/components/public/MarqueeSection";
import StatsSection from "@/components/public/StatsSection";
import ServicesSection from "@/components/public/ServicesSection";
import ProcessSection from "@/components/public/ProcessSection";
import ProjectsSection from "@/components/public/ProjectsSection";
import AboutSection from "@/components/public/AboutSection";
import TestimonialsSection from "@/components/public/TestimonialsSection";
import CTASection from "@/components/public/CTASection";
import ContactSection from "@/components/public/ContactSection";
import { ContentMap } from "@/types";

async function getHomeData() {
  const [contentItems, services, projects, testimonials] = await Promise.all([
    prisma.siteContent.findMany(),
    prisma.service.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    prisma.project.findMany({ where: { published: true, featured: true }, orderBy: { order: "asc" }, take: 6 }),
    prisma.testimonial.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
  ]);

  const content: ContentMap = {};
  contentItems.forEach((item) => { content[item.key] = item.value; });

  return { content, services, projects, testimonials };
}

export default async function HomePage() {
  const { content, services, projects, testimonials } = await getHomeData();

  return (
    <>
      {/* 1. Cinematic video hero with scroll-parallax fade */}
      <HeroSection
        title={content.hero_title}
        subtitle={content.hero_subtitle}
        ctaPrimary={content.hero_cta_primary}
        ctaSecondary={content.hero_cta_secondary}
      />

      {/* 2. Moving services ticker */}
      <MarqueeSection />

      {/* 3. Animated stat counters */}
      <StatsSection
        stats={{
          years: content.stat_years,
          projects: content.stat_projects,
          clients: content.stat_clients,
          team: content.stat_team,
        }}
      />

      {/* 4. Services grid */}
      <ServicesSection services={services} />

      {/* 5. The build journey — storytelling scroll section */}
      <ProcessSection />

      {/* 6. Featured projects */}
      <ProjectsSection projects={projects} />

      {/* 7. About / trust */}
      <AboutSection
        title={content.about_title}
        subtitle={content.about_subtitle}
        description={content.about_description}
        image={content.about_image}
      />

      {/* 8. Client testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 9. Gold CTA */}
      <CTASection title={content.cta_title} subtitle={content.cta_subtitle} />

      {/* 10. Contact form */}
      <ContactSection />
    </>
  );
}

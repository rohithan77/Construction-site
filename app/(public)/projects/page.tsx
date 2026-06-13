export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import ProjectsGrid from "./ProjectsGrid";

async function getProjects() {
  return prisma.project.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
  });
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsGrid projects={projects} />;
}

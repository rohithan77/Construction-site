export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = {};
  if (published === "true") where.published = true;
  if (category) where.category = category;
  if (featured === "true") where.featured = true;

  const projects = await prisma.project.findMany({
    where,
    orderBy: { order: "asc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const slug = body.slug || slugify(body.title);

  const project = await prisma.project.create({
    data: {
      title: body.title,
      slug,
      shortDescription: body.shortDescription,
      description: body.description ?? "",
      category: body.category,
      status: body.status ?? "completed",
      location: body.location,
      year: body.year,
      client: body.client,
      coverImage: body.coverImage,
      images: JSON.stringify(body.images ?? []),
      featured: body.featured ?? false,
      published: body.published ?? true,
      order: body.order ?? 0,
    },
  });

  return NextResponse.json(project, { status: 201 });
}

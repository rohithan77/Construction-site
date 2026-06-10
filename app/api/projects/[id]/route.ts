import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      title: body.title,
      slug: body.slug || slugify(body.title),
      shortDescription: body.shortDescription,
      description: body.description ?? "",
      category: body.category,
      status: body.status,
      location: body.location,
      year: body.year,
      client: body.client,
      coverImage: body.coverImage,
      images: JSON.stringify(body.images ?? []),
      featured: body.featured,
      published: body.published,
      order: body.order,
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

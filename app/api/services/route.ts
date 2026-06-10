export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");

  const services = await prisma.service.findMany({
    where: published === "true" ? { published: true } : {},
    orderBy: { order: "asc" },
  });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const service = await prisma.service.create({
    data: {
      title: body.title,
      slug: body.slug || slugify(body.title),
      description: body.description,
      icon: body.icon,
      image: body.image,
      features: JSON.stringify(body.features ?? []),
      published: body.published ?? true,
      order: body.order ?? 0,
    },
  });
  return NextResponse.json(service, { status: 201 });
}

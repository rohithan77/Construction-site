import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(service);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const service = await prisma.service.update({
    where: { id: params.id },
    data: {
      title: body.title,
      slug: body.slug || slugify(body.title),
      description: body.description,
      icon: body.icon,
      image: body.image,
      features: JSON.stringify(body.features ?? []),
      published: body.published,
      order: body.order,
    },
  });
  return NextResponse.json(service);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.service.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

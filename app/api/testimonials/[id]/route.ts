export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const testimonial = await prisma.testimonial.update({
    where: { id: params.id },
    data: {
      name: body.name,
      company: body.company,
      role: body.role,
      text: body.text,
      rating: body.rating,
      avatar: body.avatar,
      published: body.published,
      order: body.order,
    },
  });
  return NextResponse.json(testimonial);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.testimonial.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

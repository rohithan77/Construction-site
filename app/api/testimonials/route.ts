export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const published = searchParams.get("published");

  const testimonials = await prisma.testimonial.findMany({
    where: published === "true" ? { published: true } : {},
    orderBy: { order: "asc" },
  });
  return NextResponse.json(testimonials);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const testimonial = await prisma.testimonial.create({
    data: {
      name: body.name,
      company: body.company,
      role: body.role,
      text: body.text,
      rating: body.rating ?? 5,
      avatar: body.avatar,
      published: body.published ?? true,
      order: body.order ?? 0,
    },
  });
  return NextResponse.json(testimonial, { status: 201 });
}

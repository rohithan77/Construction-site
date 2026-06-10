import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const unread = searchParams.get("unread");

  const messages = await prisma.message.findMany({
    where: unread === "true" ? { read: false } : {},
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      service: body.service,
      message: body.message,
    },
  });
  return NextResponse.json(message, { status: 201 });
}

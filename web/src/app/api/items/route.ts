import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const items = await prisma.item.findMany({
    where: status ? { status } : undefined,
    include: { _count: { select: { bids: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const user = session.user as { role?: string };
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, condition, startingPrice, photos, startDate, endDate, status } = body;

  if (!title || !description || !condition || !startingPrice || !startDate || !endDate) {
    return NextResponse.json({ error: "Campos obrigatorios faltando" }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      title,
      description,
      condition,
      startingPrice: Number(startingPrice),
      currentPrice: Number(startingPrice),
      photos: JSON.stringify(photos || []),
      status: status || "active",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}

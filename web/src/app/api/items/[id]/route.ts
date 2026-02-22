import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      bids: {
        include: { user: { select: { id: true, name: true, department: true } } },
        orderBy: { createdAt: "desc" },
      },
      winner: { select: { id: true, name: true, email: true, cpf: true, department: true } },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const user = session.user as { role?: string };
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, description, condition, startingPrice, photos, status, startDate, endDate } = body;

  // Auto-finalize: when status changes to "ended", determine winner
  let winnerData = {};
  if (status === "ended") {
    const currentItem = await prisma.item.findUnique({ where: { id }, select: { status: true } });
    if (currentItem && currentItem.status !== "ended") {
      const topBid = await prisma.bid.findFirst({
        where: { itemId: id },
        orderBy: { amount: "desc" },
      });
      if (topBid) {
        winnerData = {
          winnerId: topBid.userId,
          paymentStatus: "pending",
          releaseStatus: "pending",
        };
      }
    }
  }

  const item = await prisma.item.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(condition && { condition }),
      ...(startingPrice && { startingPrice: Number(startingPrice) }),
      ...(photos && { photos: JSON.stringify(photos) }),
      ...(status && { status }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...winnerData,
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const user = session.user as { role?: string };
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.$transaction([
    prisma.bid.deleteMany({ where: { itemId: id } }),
    prisma.item.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true });
}

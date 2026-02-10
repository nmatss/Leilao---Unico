import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { id: itemId } = await params;
  const { amount } = await req.json();

  if (!amount || typeof amount !== "number") {
    return NextResponse.json({ error: "Valor invalido" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const bid = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("Item nao encontrado");
      if (item.status !== "active") throw new Error("Leilao nao esta ativo");
      if (new Date() > item.endDate) throw new Error("Leilao ja encerrado");
      if (amount <= item.currentPrice) {
        throw new Error(`Lance deve ser maior que R$ ${item.currentPrice.toFixed(2)}`);
      }

      const newBid = await tx.bid.create({
        data: { amount, itemId, userId },
      });

      await tx.item.update({
        where: { id: itemId },
        data: { currentPrice: amount },
      });

      return newBid;
    });

    return NextResponse.json({ bid }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar lance";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

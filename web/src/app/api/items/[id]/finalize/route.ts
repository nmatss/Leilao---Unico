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

  const user = session.user as { role?: string };
  const role = user.role;

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  // Role-based access: financeiro can mark-paid, ti can mark-released, admin can do both
  if (action === "mark-paid" && role !== "admin" && role !== "financeiro") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  if (action === "mark-released" && role !== "admin" && role !== "ti") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  if (action !== "mark-paid" && action !== "mark-released") {
    return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
  }

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Item nao encontrado" }, { status: 404 });
  }

  if (item.status !== "ended") {
    return NextResponse.json({ error: "Item nao esta encerrado" }, { status: 400 });
  }

  if (!item.winnerId) {
    return NextResponse.json({ error: "Item nao possui vencedor" }, { status: 400 });
  }

  if (action === "mark-paid") {
    if (item.paymentStatus === "paid") {
      return NextResponse.json({ error: "Pagamento ja confirmado" }, { status: 400 });
    }

    const updated = await prisma.item.update({
      where: { id },
      data: { paymentStatus: "paid", paymentDate: new Date() },
    });
    return NextResponse.json({ item: updated });
  }

  if (action === "mark-released") {
    if (item.paymentStatus !== "paid") {
      return NextResponse.json({ error: "Pagamento ainda nao confirmado" }, { status: 400 });
    }
    if (item.releaseStatus === "released") {
      return NextResponse.json({ error: "Retirada ja confirmada" }, { status: 400 });
    }

    const updated = await prisma.item.update({
      where: { id },
      data: { releaseStatus: "released", releaseDate: new Date() },
    });
    return NextResponse.json({ item: updated });
  }

  return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
}

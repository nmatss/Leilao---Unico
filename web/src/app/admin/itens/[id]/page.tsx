import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ItemDetail from "../components/ItemDetail";

export const dynamic = "force-dynamic";

export default async function AdminItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string })?.role || "employee";

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      bids: {
        include: { user: { select: { id: true, name: true, department: true } } },
        orderBy: { amount: "desc" },
      },
      winner: { select: { id: true, name: true, email: true, cpf: true, department: true } },
    },
  });

  if (!item) notFound();

  // Serialize Date objects for client component
  const serialized = JSON.parse(JSON.stringify(item));

  return (
    <div>
      <ItemDetail item={serialized} userRole={userRole} />
    </div>
  );
}

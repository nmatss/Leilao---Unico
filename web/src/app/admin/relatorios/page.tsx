import { prisma } from "@/lib/prisma";
import ReportsTable from "./components/ReportsTable";

export const dynamic = "force-dynamic";

export default async function AdminRelatoriosPage() {
  const items = await prisma.item.findMany({
    where: { status: "ended" },
    orderBy: { updatedAt: "desc" },
    include: {
      winner: { select: { id: true, name: true, department: true } },
      _count: { select: { bids: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Relatorios</h1>
      <ReportsTable items={items} />
    </div>
  );
}

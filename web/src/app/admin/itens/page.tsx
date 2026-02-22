import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ItemsTable from "./components/ItemsTable";

export const dynamic = "force-dynamic";

export default async function AdminItensPage() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bids: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Itens</h1>
        <Link
          href="/admin/itens/novo"
          className="px-4 py-2 bg-[#0056B8] text-white rounded-lg text-sm font-medium hover:bg-[#003A78] transition-colors"
        >
          Novo Item
        </Link>
      </div>

      <ItemsTable items={items} />
    </div>
  );
}

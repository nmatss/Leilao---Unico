import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LeiloesPage() {
  let items: { id: string; title: string; description: string; condition: string; currentPrice: number; photos: string; status: string; endDate: Date; _count: { bids: number } }[] = [];
  try {
    items = await prisma.item.findMany({
      where: { status: { in: ["active", "ended"] } },
      include: { _count: { select: { bids: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // DB not available yet
  }

  const statusLabel: Record<string, { text: string; color: string }> = {
    active: { text: "Ativo", color: "bg-green-100 text-green-700" },
    ended: { text: "Encerrado", color: "bg-gray-100 text-gray-600" },
    draft: { text: "Rascunho", color: "bg-yellow-100 text-yellow-700" },
    cancelled: { text: "Cancelado", color: "bg-red-100 text-red-600" },
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-foreground">Leiloes</h1>
      <p className="mt-1 text-gray-500">Explore os itens disponiveis</p>

      {items.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const photos: string[] = JSON.parse(item.photos || "[]");
            const badge = statusLabel[item.status] || statusLabel.active;
            return (
              <Link
                key={item.id}
                href={`/leiloes/${item.id}`}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                  {photos.length > 0 ? (
                    <img src={photos[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className={`absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full ${badge.color}`}>
                    {badge.text}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-foreground">{item.title}</h4>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#0056B8]">
                      R$ {item.currentPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-gray-500">{item._count.bids} lance(s)</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {item.condition} &middot; Encerra {new Date(item.endDate).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 text-center py-16 bg-white rounded-xl border border-gray-200">
          <svg className="mx-auto w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="mt-4 text-gray-500">Nenhum leilao disponivel</p>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let items: { id: string; title: string; currentPrice: number; photos: string; status: string; _count: { bids: number } }[] = [];
  try {
    items = await prisma.item.findMany({
      where: { status: "active" },
      include: { _count: { select: { bids: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch {
    // DB not available yet
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        <section className="bg-[#0056B8] text-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Leilao Corporativo
            </h2>
            <p className="mt-2 text-lg font-medium text-blue-200">Grupo Unico</p>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-blue-100">
              Leilao interno exclusivo para funcionarios. Encontre produtos com precos especiais e de seus lances.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/leiloes"
                className="rounded-lg bg-white text-[#0056B8] px-6 py-3 text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                Ver leiloes
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-white/30 text-white px-6 py-3 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Entrar
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-foreground">Leiloes em destaque</h3>
            <Link href="/leiloes" className="text-sm text-[#0056B8] hover:underline font-medium">
              Ver todos
            </Link>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const photos: string[] = JSON.parse(item.photos || "[]");
                return (
                  <Link
                    key={item.id}
                    href={`/leiloes/${item.id}`}
                    className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      {photos.length > 0 ? (
                        <img src={photos[0]} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-bold text-[#0056B8]">
                          R$ {item.currentPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-gray-500">{item._count.bids} lance(s)</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <svg className="mx-auto w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="mt-4 text-gray-500">Nenhum leilao ativo no momento</p>
              <p className="mt-1 text-sm text-gray-400">Novos itens serao adicionados em breve</p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-gray-500">
          Leilao Corporativo - Grupo Unico - Uso interno
        </div>
      </footer>
    </div>
  );
}

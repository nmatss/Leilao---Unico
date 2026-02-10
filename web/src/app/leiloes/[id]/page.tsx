import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BidForm from "@/components/BidForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function LeilaoDetailPage({ params }: Props) {
  const { id } = await params;

  let item;
  try {
    item = await prisma.item.findUnique({
      where: { id },
      include: {
        bids: {
          include: { user: { select: { name: true, department: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    notFound();
  }

  if (!item) notFound();

  const photos: string[] = JSON.parse(item.photos || "[]");

  const statusLabel: Record<string, { text: string; color: string }> = {
    active: { text: "Ativo", color: "bg-green-100 text-green-700" },
    ended: { text: "Encerrado", color: "bg-gray-100 text-gray-600" },
    draft: { text: "Rascunho", color: "bg-yellow-100 text-yellow-700" },
    cancelled: { text: "Cancelado", color: "bg-red-100 text-red-600" },
  };
  const badge = statusLabel[item.status] || statusLabel.active;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/leiloes" className="text-sm text-[#0056B8] hover:underline">
        &larr; Voltar para leiloes
      </Link>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Photo gallery */}
        <div>
          <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square flex items-center justify-center">
            {photos.length > 0 ? (
              <img src={photos[0]} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {photos.slice(1, 5).map((photo, i) => (
                <div key={i} className="rounded-lg overflow-hidden bg-gray-100 aspect-square">
                  <img src={photo} alt={`${item.title} ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.color}`}>
              {badge.text}
            </span>
            <span className="text-sm text-gray-400">{item.condition}</span>
          </div>

          <h1 className="mt-3 text-3xl font-bold text-foreground">{item.title}</h1>
          <p className="mt-3 text-gray-600 leading-relaxed">{item.description}</p>

          <div className="mt-6 p-5 bg-[#E8F0FE] rounded-xl">
            <div className="text-sm text-gray-500">Lance atual</div>
            <div className="mt-1 text-3xl font-bold text-[#0056B8]">
              R$ {item.currentPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Preco inicial: R$ {item.startingPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>

            {item.status === "active" && (
              <BidForm itemId={item.id} currentPrice={item.currentPrice} />
            )}
          </div>

          <div className="mt-4 flex gap-6 text-sm text-gray-500">
            <div>
              <span className="font-medium">Inicio:</span>{" "}
              {new Date(item.startDate).toLocaleDateString("pt-BR")}
            </div>
            <div>
              <span className="font-medium">Termino:</span>{" "}
              {new Date(item.endDate).toLocaleDateString("pt-BR")}
            </div>
          </div>

          {/* Bid history */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground">Historico de lances</h3>
            {item.bids.length > 0 ? (
              <div className="mt-3 space-y-2">
                {item.bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div>
                      <span className="text-sm font-medium">{bid.user.name}</span>
                      {bid.user.department && (
                        <span className="ml-2 text-xs text-gray-400">{bid.user.department}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#0056B8]">
                        R$ {bid.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(bid.createdAt).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-400">Nenhum lance ainda. Seja o primeiro!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

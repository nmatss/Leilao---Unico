"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface Item {
  id: string;
  title: string;
  startingPrice: number;
  currentPrice: number;
  status: string;
  photos: string;
  paymentStatus: string | null;
  releaseStatus: string | null;
  winnerId: string | null;
  _count: { bids: number };
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  ended: "bg-red-100 text-red-800",
  cancelled: "bg-yellow-100 text-yellow-800",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  draft: "Rascunho",
  ended: "Encerrado",
  cancelled: "Cancelado",
};

export default function ItemsTable({ items }: { items: Item[] }) {
  const router = useRouter();

  async function handleEnd(id: string, title: string) {
    if (!window.confirm(`Encerrar o leilao "${title}"? O vencedor sera determinado automaticamente.`)) return;

    const res = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ended" }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Erro ao encerrar leilao.");
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Excluir "${title}"? Esta acao nao pode ser desfeita.`)) return;

    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Erro ao excluir item.");
    }
  }

  function getFirstPhoto(photosJson: string): string | null {
    try {
      const arr = JSON.parse(photosJson);
      return arr.length > 0 ? arr[0] : null;
    } catch {
      return null;
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
            <th className="px-5 py-3 font-medium">Foto</th>
            <th className="px-5 py-3 font-medium">Titulo</th>
            <th className="px-5 py-3 font-medium">Preco Inicial</th>
            <th className="px-5 py-3 font-medium">Preco Atual</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Situacao</th>
            <th className="px-5 py-3 font-medium">Lances</th>
            <th className="px-5 py-3 font-medium">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-5 py-8 text-center text-gray-400">
                Nenhum item cadastrado.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const photo = getFirstPhoto(item.photos);
              return (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    {photo ? (
                      <div className="w-10 h-10 relative rounded overflow-hidden">
                        <Image src={photo} alt="" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">{item.title}</td>
                  <td className="px-5 py-3 text-gray-600">
                    R$ {item.startingPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    R$ {item.currentPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-800"}`}>
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {item.status === "ended" && item.winnerId ? (
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {item.paymentStatus === "paid" ? "Pago" : "Pgto Pendente"}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.releaseStatus === "released" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {item.releaseStatus === "released" ? "Retirado" : "Aguard. Retirada"}
                        </span>
                      </div>
                    ) : item.status === "ended" ? (
                      <span className="text-xs text-gray-400">Sem lances</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{item._count.bids}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/itens/${item.id}`)}
                        className="text-gray-600 hover:underline text-xs font-medium"
                      >
                        Ver
                      </button>
                      {item.status === "active" && (
                        <button
                          onClick={() => handleEnd(item.id, item.title)}
                          className="text-amber-600 hover:underline text-xs font-medium"
                        >
                          Encerrar
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/admin/itens/${item.id}/editar`)}
                        className="text-[#0056B8] hover:underline text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="text-red-600 hover:underline text-xs font-medium"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

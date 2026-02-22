"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  user: { id: string; name: string; department: string | null };
}

interface Winner {
  id: string;
  name: string;
  email: string;
  cpf: string;
  department: string | null;
}

interface Item {
  id: string;
  title: string;
  description: string;
  condition: string;
  startingPrice: number;
  currentPrice: number;
  photos: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  winnerId: string | null;
  winner: Winner | null;
  paymentStatus: string | null;
  paymentDate: string | null;
  releaseStatus: string | null;
  releaseDate: string | null;
  bids: Bid[];
}

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  draft: "Rascunho",
  ended: "Encerrado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  ended: "bg-red-100 text-red-800",
  cancelled: "bg-yellow-100 text-yellow-800",
};

function maskCpf(cpf: string) {
  if (cpf.length === 11) {
    return `${cpf.slice(0, 3)}.***.***.${cpf.slice(9)}`;
  }
  return cpf.replace(/(\d{3})\d{3}\d{3}(\d{2})/, "$1.***.***-$2");
}

export default function ItemDetail({ item, userRole }: { item: Item; userRole: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState(item.paymentStatus);
  const [paymentDate, setPaymentDate] = useState(item.paymentDate);
  const [releaseStatus, setReleaseStatus] = useState(item.releaseStatus);
  const [releaseDate, setReleaseDate] = useState(item.releaseDate);

  let photos: string[] = [];
  try {
    photos = JSON.parse(item.photos);
  } catch {
    // ignore
  }

  async function handleFinalize(action: "mark-paid" | "mark-released") {
    setLoading(action);
    try {
      const res = await fetch(`/api/items/${item.id}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Erro ao processar");
        return;
      }
      const data = await res.json();
      setPaymentStatus(data.item.paymentStatus);
      setPaymentDate(data.item.paymentDate);
      setReleaseStatus(data.item.releaseStatus);
      setReleaseDate(data.item.releaseDate);
      router.refresh();
    } catch {
      alert("Erro de conexao");
    } finally {
      setLoading(null);
    }
  }

  const winningBidAmount = item.bids.length > 0 ? item.bids[0].amount : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/itens" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-800"}`}>
            {STATUS_LABELS[item.status] || item.status}
          </span>
        </div>
        <Link
          href={`/admin/itens/${item.id}/editar`}
          className="px-4 py-2 bg-[#0056B8] text-white rounded-lg text-sm font-medium hover:bg-[#003A78] transition-colors"
        >
          Editar
        </Link>
      </div>

      {/* Info do Item */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Informacoes do Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Descricao</p>
            <p className="text-sm text-gray-900">{item.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Condicao</p>
            <p className="text-sm text-gray-900">{item.condition}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Preco Inicial</p>
            <p className="text-sm text-gray-900">R$ {item.startingPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Preco Atual</p>
            <p className="text-sm text-gray-900 font-semibold">R$ {item.currentPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Inicio</p>
            <p className="text-sm text-gray-900">{new Date(item.startDate).toLocaleString("pt-BR")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fim</p>
            <p className="text-sm text-gray-900">{new Date(item.endDate).toLocaleString("pt-BR")}</p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Fotos</p>
            <div className="flex gap-2 flex-wrap">
              {photos.map((url, i) => (
                <div key={i} className="w-20 h-20 relative rounded overflow-hidden border border-gray-200">
                  <Image src={url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Winner + Payment + Release */}
      {item.status === "ended" && (
        <>
          {item.winner ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Card do Vencedor */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Vencedor</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="text-sm text-gray-900 font-medium">{item.winner.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{item.winner.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CPF</p>
                    <p className="text-sm text-gray-900">{maskCpf(item.winner.cpf)}</p>
                  </div>
                  {item.winner.department && (
                    <div>
                      <p className="text-sm text-gray-500">Departamento</p>
                      <p className="text-sm text-gray-900">{item.winner.department}</p>
                    </div>
                  )}
                  {winningBidAmount !== null && (
                    <div>
                      <p className="text-sm text-gray-500">Lance Vencedor</p>
                      <p className="text-sm text-gray-900 font-bold text-green-700">
                        R$ {winningBidAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagamento */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Pagamento</h2>
                <div className="space-y-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {paymentStatus === "paid" ? "Pago" : "Pendente"}
                  </span>
                  {paymentDate && (
                    <p className="text-xs text-gray-500">
                      Confirmado em {new Date(paymentDate).toLocaleString("pt-BR")}
                    </p>
                  )}
                  {paymentStatus !== "paid" && (userRole === "admin" || userRole === "financeiro") && (
                    <button
                      onClick={() => handleFinalize("mark-paid")}
                      disabled={loading !== null}
                      className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading === "mark-paid" ? "Processando..." : "Confirmar Pagamento"}
                    </button>
                  )}
                </div>
              </div>

              {/* Retirada */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Retirada</h2>
                <div className="space-y-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    releaseStatus === "released" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {releaseStatus === "released" ? "Retirado" : "Pendente"}
                  </span>
                  {releaseDate && (
                    <p className="text-xs text-gray-500">
                      Confirmado em {new Date(releaseDate).toLocaleString("pt-BR")}
                    </p>
                  )}
                  {releaseStatus !== "released" && (userRole === "admin" || userRole === "ti") && (
                    <button
                      onClick={() => handleFinalize("mark-released")}
                      disabled={loading !== null || paymentStatus !== "paid"}
                      className="w-full mt-2 px-4 py-2 bg-[#0056B8] text-white rounded-lg text-sm font-medium hover:bg-[#003A78] transition-colors disabled:opacity-50"
                    >
                      {loading === "mark-released" ? "Processando..." : "Confirmar Retirada"}
                    </button>
                  )}
                  {paymentStatus !== "paid" && releaseStatus !== "released" && (
                    <p className="text-xs text-gray-400">Aguardando confirmacao do pagamento</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-gray-500">Leilao encerrado sem lances.</p>
            </div>
          )}
        </>
      )}

      {/* Historico de Lances */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Historico de Lances ({item.bids.length})</h2>
        </div>
        {item.bids.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400">
            Nenhum lance registrado.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">Participante</th>
                <th className="px-5 py-3 font-medium">Departamento</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {item.bids.map((bid, index) => (
                <tr
                  key={bid.id}
                  className={`border-b border-gray-50 ${index === 0 && item.winnerId ? "bg-green-50" : "hover:bg-gray-50"}`}
                >
                  <td className="px-5 py-3 text-gray-600">
                    {index === 0 && item.winnerId ? (
                      <span className="text-green-700 font-bold">1o</span>
                    ) : (
                      `${index + 1}o`
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {bid.user.name}
                    {bid.user.id === item.winnerId && (
                      <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Vencedor</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{bid.user.department || "—"}</td>
                  <td className="px-5 py-3 text-gray-900 font-medium">
                    R$ {bid.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {new Date(bid.createdAt).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

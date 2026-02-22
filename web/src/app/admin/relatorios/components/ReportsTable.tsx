"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReportItem {
  id: string;
  title: string;
  currentPrice: number;
  winnerId: string | null;
  winner: { id: string; name: string; department: string | null } | null;
  paymentStatus: string | null;
  releaseStatus: string | null;
  _count: { bids: number };
}

type Tab = "todos" | "pgto-pendente" | "aguardando-retirada" | "concluidos" | "sem-lances";

const TABS: { key: Tab; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pgto-pendente", label: "Pgto Pendente" },
  { key: "aguardando-retirada", label: "Aguardando Retirada" },
  { key: "concluidos", label: "Concluidos" },
  { key: "sem-lances", label: "Sem Lances" },
];

function filterItems(items: ReportItem[], tab: Tab): ReportItem[] {
  switch (tab) {
    case "pgto-pendente":
      return items.filter((i) => i.winnerId && i.paymentStatus === "pending");
    case "aguardando-retirada":
      return items.filter((i) => i.winnerId && i.paymentStatus === "paid" && i.releaseStatus === "pending");
    case "concluidos":
      return items.filter((i) => i.winnerId && i.releaseStatus === "released");
    case "sem-lances":
      return items.filter((i) => !i.winnerId);
    default:
      return items;
  }
}

export default function ReportsTable({ items }: { items: ReportItem[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("todos");

  const filtered = filterItems(items, activeTab);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "text-[#0056B8] border-b-2 border-[#0056B8]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
            <th className="px-5 py-3 font-medium">Item</th>
            <th className="px-5 py-3 font-medium">Vencedor</th>
            <th className="px-5 py-3 font-medium">Departamento</th>
            <th className="px-5 py-3 font-medium">Valor Final</th>
            <th className="px-5 py-3 font-medium">Lances</th>
            <th className="px-5 py-3 font-medium">Pagamento</th>
            <th className="px-5 py-3 font-medium">Retirada</th>
            <th className="px-5 py-3 font-medium">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-5 py-8 text-center text-gray-400">
                Nenhum item encontrado nesta categoria.
              </td>
            </tr>
          ) : (
            filtered.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{item.title}</td>
                <td className="px-5 py-3 text-gray-600">{item.winner?.name || "—"}</td>
                <td className="px-5 py-3 text-gray-600">{item.winner?.department || "—"}</td>
                <td className="px-5 py-3 text-gray-900 font-medium">
                  R$ {item.currentPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3 text-gray-600">{item._count.bids}</td>
                <td className="px-5 py-3">
                  {item.winnerId ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {item.paymentStatus === "paid" ? "Pago" : "Pendente"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {item.winnerId ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.releaseStatus === "released" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {item.releaseStatus === "released" ? "Retirado" : "Pendente"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => router.push(`/admin/itens/${item.id}`)}
                    className="text-[#0056B8] hover:underline text-xs font-medium"
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

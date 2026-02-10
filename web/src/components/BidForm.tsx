"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BidForm({ itemId, currentPrice }: { itemId: string; currentPrice: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const value = Number(amount);
    if (!value || value <= currentPrice) {
      setError(`Lance deve ser maior que R$ ${currentPrice.toFixed(2)}`);
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/items/${itemId}/bids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: value }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erro ao dar lance");
      return;
    }

    setSuccess("Lance realizado com sucesso!");
    setAmount("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={(currentPrice + 10).toFixed(2)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0056B8] focus:border-transparent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#0056B8] text-white rounded-lg text-sm font-medium hover:bg-[#003A78] disabled:opacity-50 transition-colors"
        >
          {loading ? "Enviando..." : "Dar Lance"}
        </button>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
          {success}
        </div>
      )}
    </form>
  );
}

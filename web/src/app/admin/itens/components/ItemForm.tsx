"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PhotoUpload from "./PhotoUpload";

interface ItemData {
  id?: string;
  title: string;
  description: string;
  condition: string;
  startingPrice: number;
  startDate: string;
  endDate: string;
  status: string;
  photos: string[];
}

interface ItemFormProps {
  initialData?: ItemData;
}

export default function ItemForm({ initialData }: ItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [condition, setCondition] = useState(initialData?.condition || "Novo");
  const [startingPrice, setStartingPrice] = useState(initialData?.startingPrice?.toString() || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [status, setStatus] = useState(initialData?.status || "draft");

  const newFilesRef = useRef<File[]>([]);
  const existingUrlsRef = useRef<string[]>(initialData?.photos || []);

  function handlePhotosChange(files: File[], existingUrls: string[]) {
    newFilesRef.current = files;
    existingUrlsRef.current = existingUrls;
  }

  async function uploadFiles(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Falha no upload de foto");
      const data = await res.json();
      urls.push(data.url);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title || !description || !condition || !startingPrice || !startDate || !endDate) {
      setError("Preencha todos os campos obrigatorios.");
      return;
    }

    setLoading(true);
    try {
      let uploadedUrls: string[] = [];
      if (newFilesRef.current.length > 0) {
        uploadedUrls = await uploadFiles(newFilesRef.current);
      }

      const photos = [...existingUrlsRef.current, ...uploadedUrls];

      const body = {
        title,
        description,
        condition,
        startingPrice: Number(startingPrice),
        startDate,
        endDate,
        status,
        photos,
      };

      const url = initialData?.id ? `/api/items/${initialData.id}` : "/api/items";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar item");
      }

      router.push("/admin/itens");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0056B8] focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descricao *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0056B8] focus:border-transparent outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condicao *</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0056B8] focus:border-transparent outline-none"
          >
            <option value="Novo">Novo</option>
            <option value="Semi-novo">Semi-novo</option>
            <option value="Usado">Usado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preco Inicial (R$) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0056B8] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicio *</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0056B8] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim *</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0056B8] focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "ended") {
              if (!window.confirm("Tem certeza que deseja encerrar este leilao? O vencedor sera determinado automaticamente.")) return;
            }
            setStatus(val);
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0056B8] focus:border-transparent outline-none"
        >
          <option value="draft">Rascunho</option>
          <option value="active">Ativo</option>
          <option value="ended">Encerrado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      <PhotoUpload
        existingPhotos={initialData?.photos}
        onPhotosChange={handlePhotosChange}
      />

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#0056B8] text-white rounded-lg text-sm font-medium hover:bg-[#003A78] transition-colors disabled:opacity-50"
        >
          {loading ? "Salvando..." : initialData?.id ? "Atualizar" : "Criar Item"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/itens")}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

import { useEffect, useState } from "react";
import api from "./lib/api";
import "./App.css";

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
  _count?: { bids: number };
}

interface Metrics {
  activeItems: number;
  totalUsers: number;
  totalBids: number;
  totalValue: string;
}

const statusBadge: Record<string, { text: string; cls: string }> = {
  active: { text: "Ativo", cls: "bg-green-100 text-green-700" },
  ended: { text: "Encerrado", cls: "bg-gray-100 text-gray-600" },
  draft: { text: "Rascunho", cls: "bg-yellow-100 text-yellow-700" },
  cancelled: { text: "Cancelado", cls: "bg-red-100 text-red-600" },
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ activeItems: 0, totalUsers: 0, totalBids: 0, totalValue: "R$ 0" });
  const [activeTab, setActiveTab] = useState("Itens");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadItems() {
    try {
      const res = await api.get("/api/items");
      const loadedItems: Item[] = res.data.items || [];
      setItems(loadedItems);

      const active = loadedItems.filter((i) => i.status === "active").length;
      const bids = loadedItems.reduce((sum, i) => sum + (i._count?.bids || 0), 0);
      const value = loadedItems.reduce((sum, i) => sum + i.currentPrice, 0);
      setMetrics({
        activeItems: active,
        totalUsers: 0,
        totalBids: bids,
        totalValue: `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      });
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    try {
      await api.delete(`/api/items/${id}`);
      loadItems();
    } catch {
      alert("Erro ao excluir item");
    }
  }

  function openEdit(item: Item) {
    setEditingItem(item);
    setShowModal(true);
  }

  function openNew() {
    setEditingItem(null);
    setShowModal(true);
  }

  const tabs = ["Itens", "Usuarios", "Relatorios", "Configuracoes"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0056B8] text-white">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-unico.svg" alt="Grupo Unico" className="h-8 brightness-0 invert" />
            <span className="text-white/60">|</span>
            <span className="text-sm font-medium">Painel Administrativo</span>
          </div>
          <a
            href={API_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-white/80 hover:text-white"
          >
            Ver site
          </a>
        </div>
      </header>

      {/* Metrics */}
      <div className="bg-gradient-to-b from-[#E8F0FE] to-transparent">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie leiloes, usuarios e relatorios</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Leiloes Ativos" value={String(metrics.activeItems)} />
            <MetricCard title="Usuarios" value={String(metrics.totalUsers)} />
            <MetricCard title="Total de Lances" value={String(metrics.totalBids)} />
            <MetricCard title="Valor Total" value={metrics.totalValue} />
          </div>

          <div className="mt-4 flex gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  activeTab === t
                    ? "bg-white shadow-sm border-gray-200 text-[#0056B8] font-medium"
                    : "bg-gray-100 border-transparent text-gray-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-5 py-6">
        {activeTab === "Itens" && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Gerenciar Itens</h2>
                <p className="text-sm text-gray-500">Adicione, edite ou remova itens do leilao</p>
              </div>
              <button
                onClick={openNew}
                className="rounded-lg bg-[#0056B8] px-4 py-2 text-sm font-medium text-white hover:bg-[#003A78]"
              >
                + Novo Item
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {["Item", "Estado", "Lance Atual", "Lances", "Status", "Termino", "Acoes"].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-400">Carregando...</td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Nenhum item encontrado</td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const badge = statusBadge[item.status] || statusBadge.active;
                      return (
                        <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{item.title}</td>
                          <td className="px-4 py-3 text-gray-500">{item.condition}</td>
                          <td className="px-4 py-3">
                            R$ {item.currentPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{item._count?.bids || 0}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.cls}`}>
                              {badge.text}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(item.endDate).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEdit(item)}
                                className="text-sm text-[#0056B8] hover:underline"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-sm text-red-500 hover:underline"
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
          </section>
        )}

        {activeTab === "Usuarios" && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center py-16">
            <p className="text-gray-500">Gerenciamento de usuarios em breve</p>
          </section>
        )}

        {activeTab === "Relatorios" && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center py-16">
            <p className="text-gray-500">Relatorios em breve</p>
          </section>
        )}

        {activeTab === "Configuracoes" && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center py-16">
            <p className="text-gray-500">Configuracoes em breve</p>
          </section>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <ItemFormModal
          item={editingItem}
          onClose={() => { setShowModal(false); setEditingItem(null); }}
          onSaved={() => { setShowModal(false); setEditingItem(null); loadItems(); }}
        />
      )}
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function ItemFormModal({
  item,
  onClose,
  onSaved,
}: {
  item: Item | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [condition, setCondition] = useState(item?.condition || "Novo");
  const [startingPrice, setStartingPrice] = useState(item?.startingPrice?.toString() || "");
  const [status, setStatus] = useState(item?.status || "active");
  const [startDate, setStartDate] = useState(item?.startDate?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(item?.endDate?.slice(0, 10) || "");
  const [photos, setPhotos] = useState<string[]>(item?.photos ? JSON.parse(item.photos) : []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await api.post("/api/upload", formData);
        setPhotos((prev) => [...prev, res.data.url]);
      } catch {
        setError("Erro ao fazer upload");
      }
    }
    setUploading(false);
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title || !description || !startingPrice || !endDate) {
      setError("Preencha todos os campos obrigatorios");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        description,
        condition,
        startingPrice: Number(startingPrice),
        photos,
        status,
        startDate,
        endDate,
      };

      if (item) {
        await api.put(`/api/items/${item.id}`, payload);
      } else {
        await api.post("/api/items", payload);
      }
      onSaved();
    } catch {
      setError("Erro ao salvar item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{item ? "Editar Item" : "Novo Item"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0056B8]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descricao *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0056B8]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condicao</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0056B8]"
              >
                <option>Novo</option>
                <option>Semi-novo</option>
                <option>Usado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preco inicial (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0056B8]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0056B8]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data termino *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0056B8]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0056B8]"
            >
              <option value="active">Ativo</option>
              <option value="draft">Rascunho</option>
              <option value="ended">Encerrado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#E8F0FE] file:text-[#0056B8] hover:file:bg-blue-100"
            />
            {uploading && <p className="mt-1 text-xs text-gray-400">Enviando...</p>}

            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={photo.startsWith("http") ? photo : `${API_URL}${photo}`}
                      alt={`Foto ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-[#0056B8] rounded-lg hover:bg-[#003A78] disabled:opacity-50"
            >
              {saving ? "Salvando..." : item ? "Atualizar" : "Criar Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

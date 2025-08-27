export default async function LeiloesPage() {
  const res = await fetch("http://localhost:3000/api/leiloes", { cache: "no-store" });
  const data = await res.json();
  const itens: Array<{ id: string; titulo: string; lanceAtual: number; encerramento: string }>
    = data.itens ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Leilões</h1>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {itens.map((i) => (
          <a key={i.id} href={`/leiloes/${i.id}`} className="rounded-2xl border border-white/10 p-5 hover:bg-white/5">
            <div className="text-sm opacity-70">Lote #{i.id}</div>
            <div className="mt-2 text-lg font-medium">{i.titulo}</div>
            <div className="mt-2 text-sm opacity-70">Lance atual: R$ {i.lanceAtual.toLocaleString("pt-BR")}</div>
          </a>
        ))}
      </div>
    </div>
  );
} 
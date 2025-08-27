type Params = { params: { id: string } };

export default function LeilaoDetailPage({ params }: Params) {
  const { id } = params;
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <a href="/leiloes" className="text-sm underline underline-offset-4">← Voltar</a>
      <h1 className="mt-4 text-3xl font-semibold">Leilão #{id}</h1>
      <p className="mt-2 opacity-80">Detalhes do item, lances e tempo restante aparecerão aqui.</p>

      <div className="mt-8 rounded-2xl border border-white/10 p-6">
        <div className="text-sm opacity-70">Lance atual</div>
        <div className="mt-1 text-2xl font-bold">R$ {(1000 * Number(id)).toLocaleString("pt-BR")}</div>
        <div className="mt-6 flex gap-3">
          <button className="rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:opacity-90">Dar lance + R$ 100</button>
          <button className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium hover:bg-white/5">Atualizar</button>
        </div>
      </div>
    </div>
  );
} 
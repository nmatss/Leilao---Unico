import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="w-full border-b border-white/10 dark:border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Leilão Unic</h1>
          <nav className="flex gap-6 text-sm opacity-80">
            <a href="#leiloes" className="hover:opacity-100">Leilões</a>
            <a href="#como-funciona" className="hover:opacity-100">Como funciona</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Bem-vindo ao Leilão Unic</h2>
          <p className="mt-4 max-w-2xl text-base sm:text-lg opacity-80">
            Plataforma para publicar itens, dar lances em tempo real e acompanhar resultados.
          </p>
          <div className="mt-8 flex gap-4">
            <a href="#leiloes" className="rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:opacity-90">
              Ver leilões
            </a>
            <a href="#criar" className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium hover:bg-white/5">
              Criar leilão
            </a>
          </div>
        </section>

        <section id="leiloes" className="mx-auto max-w-5xl px-6 pb-16">
          <h3 className="text-2xl font-semibold">Leilões em destaque</h3>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 p-5">
                <div className="text-sm opacity-70">Lote #{i}</div>
                <div className="mt-2 text-lg font-medium">Item de exemplo {i}</div>
                <div className="mt-2 text-sm opacity-70">Lance atual: R$ {(1000 * i).toLocaleString("pt-BR")}</div>
                <a href="#" className="mt-4 inline-block text-sm font-medium text-foreground/90 underline underline-offset-4">
                  Ver detalhes
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-6 text-sm opacity-70">
          Ambiente de desenvolvimento — Next.js + Tailwind
        </div>
      </footer>
    </div>
  );
}

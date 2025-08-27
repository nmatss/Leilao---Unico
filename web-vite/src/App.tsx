import './App.css'

export default function App() {
  function MetricCard({ title, value, icon }: { title: string; value: string; icon?: string }) {
    return (
      <div className="flex-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-gray-400">{icon}</div>
        </div>
        <div className="mt-2 text-3xl font-semibold">{value}</div>
      </div>
    );
  }

  function Tabs() {
    return (
      <div className="mt-4 flex gap-2">
        {[
          { label: "Itens", active: true },
          { label: "Usuários" },
          { label: "Relatórios" },
          { label: "Configurações" },
        ].map((t) => (
          <button
            key={t.label}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${t.active ? "bg-white shadow-sm border-gray-200" : "bg-gray-100 border-transparent"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-b from-blue-50 to-transparent">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
          <p className="mt-1 text-gray-500">Gerencie leilões, usuários e relatórios</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Leilões Ativos" value="0" icon="📦" />
            <MetricCard title="Usuários Cadastrados" value="0" icon="👥" />
            <MetricCard title="Total de Lances" value="0" icon="📊" />
            <MetricCard title="Valor Total" value="R$ 0" icon="💲" />
          </div>

          <Tabs />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Gerenciar Itens</h2>
              <p className="text-sm text-gray-500">Adicione, edite ou remova itens do leilão</p>
            </div>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ Novo Item</button>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  {['Item','Estado','Lance Atual','Lances','Status','Término','Ações'].map(h => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Nenhum item encontrado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface User {
  id: string;
  cpf: string;
  name: string;
  email: string;
  department: string | null;
  role: string;
  createdAt: string;
}

interface ImportError {
  cpf: string;
  message: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  employee: "Funcionario",
  financeiro: "Financeiro",
  ti: "TI",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-blue-100 text-blue-800",
  employee: "bg-gray-100 text-gray-800",
  financeiro: "bg-green-100 text-green-800",
  ti: "bg-purple-100 text-purple-800",
};

function maskCpf(cpf: string): string {
  if (cpf.length !== 11) return cpf;
  return `${cpf.slice(0, 3)}.***.***.${cpf.slice(9)}`;
}

export function UsersClient({
  users,
  userRole,
}: {
  users: User[];
  userRole: string;
}) {
  const router = useRouter();
  const isAdmin = userRole === "admin";

  const [showInsert, setShowInsert] = useState(false);
  const [showImport, setShowImport] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        {isAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowInsert(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Inserir Usuario
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Importar Planilha
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">CPF</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Departamento</th>
              <th className="px-5 py-3 font-medium">Perfil</th>
              <th className="px-5 py-3 font-medium">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-gray-400"
                >
                  Nenhum usuario cadastrado.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-5 py-3 text-gray-600 font-mono text-xs">
                    {maskCpf(user.cpf)}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{user.email}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {user.department || "\u2014"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        ROLE_COLORS[user.role] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showInsert && (
        <InsertModal
          onClose={() => setShowInsert(false)}
          onSuccess={() => {
            setShowInsert(false);
            router.refresh();
          }}
        />
      )}

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ─── Modal: Inserir Usuario ─── */

function InsertModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    email: "",
    password: "",
    department: "",
    role: "employee",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: form }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar usuario");
        return;
      }
      onSuccess();
    } catch {
      setError("Erro de conexao");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Inserir Usuario
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                required
                placeholder="00000000000"
                value={form.cpf}
                onChange={(e) => set("cpf", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha *
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perfil
              </label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="employee">Funcionario</option>
                <option value="admin">Administrador</option>
                <option value="financeiro">Financeiro</option>
                <option value="ti">TI</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Modal: Importar Planilha ─── */

interface ParsedRow {
  cpf: string;
  name: string;
  email: string;
  password: string;
  department: string;
  role: string;
}

function ImportModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    errors: ImportError[];
  } | null>(null);
  const [parseError, setParseError] = useState("");
  const [showAllErrors, setShowAllErrors] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError("");
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
          defval: "",
        });

        const parsed: ParsedRow[] = json.map((row) => ({
          cpf: String(row["cpf"] || row["CPF"] || "").replace(/\D/g, ""),
          name: String(row["nome"] || row["Nome"] || row["name"] || row["Name"] || ""),
          email: String(row["email"] || row["Email"] || row["e-mail"] || ""),
          password: String(row["senha"] || row["Senha"] || row["password"] || ""),
          department: String(row["departamento"] || row["Departamento"] || row["department"] || ""),
          role: String(row["perfil"] || row["Perfil"] || row["role"] || "employee").toLowerCase(),
        }));

        if (parsed.length === 0) {
          setParseError("Nenhuma linha encontrada na planilha.");
          return;
        }

        setRows(parsed);
      } catch {
        setParseError("Erro ao ler o arquivo. Verifique o formato.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleImport() {
    setLoading(true);
    setResult(null);

    try {
      const payload = rows.map((r) => ({
        cpf: r.cpf,
        name: r.name,
        email: r.email,
        password: r.password,
        department: r.department || undefined,
        role: r.role || "employee",
      }));

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: payload }),
      });

      const data = await res.json();
      setResult({ created: data.created ?? 0, errors: data.errors ?? [] });
    } catch {
      setResult({ created: 0, errors: [{ cpf: "-", message: "Erro de conexao" }] });
    } finally {
      setLoading(false);
    }
  }

  const preview = rows.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Importar Planilha
        </h2>

        {/* File input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione um arquivo .xlsx ou .csv
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFile}
            className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {fileName && (
            <p className="text-xs text-gray-500 mt-1">Arquivo: {fileName}</p>
          )}
        </div>

        {parseError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            {parseError}
          </p>
        )}

        {/* Preview */}
        {rows.length > 0 && !result && (
          <>
            <p className="text-sm text-gray-700 mb-2">
              <strong>{rows.length}</strong> usuario(s) encontrado(s).
              {rows.length > 5 && " Mostrando primeiros 5:"}
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="px-3 py-2 text-left font-medium">CPF</th>
                    <th className="px-3 py-2 text-left font-medium">Nome</th>
                    <th className="px-3 py-2 text-left font-medium">Email</th>
                    <th className="px-3 py-2 text-left font-medium">Perfil</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-3 py-1.5 font-mono">{r.cpf}</td>
                      <td className="px-3 py-1.5">{r.name}</td>
                      <td className="px-3 py-1.5">{r.email}</td>
                      <td className="px-3 py-1.5">
                        {ROLE_LABELS[r.role] || r.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleImport}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading
                ? "Importando..."
                : `Importar ${rows.length} usuario(s)`}
            </button>
          </>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <p className="text-sm text-green-800">
                <strong>{result.created}</strong> usuario(s) importado(s)
                {result.errors.length > 0 && (
                  <>
                    , <strong className="text-red-700">{result.errors.length}</strong> erro(s)
                  </>
                )}
              </p>
            </div>

            {result.errors.length > 0 && (
              <div>
                <button
                  onClick={() => setShowAllErrors(!showAllErrors)}
                  className="text-sm text-red-600 hover:underline"
                >
                  {showAllErrors ? "Ocultar erros" : "Ver erros"}
                </button>
                {showAllErrors && (
                  <ul className="mt-2 space-y-1 text-xs text-red-700 bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {result.errors.map((err, i) => (
                      <li key={i}>
                        CPF {err.cpf}: {err.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              onClick={onSuccess}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Cancel (only before result) */}
        {!result && (
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

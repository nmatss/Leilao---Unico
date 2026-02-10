"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-unico.svg" alt="Grupo Unico" width={160} height={40} />
          </Link>
          <span className="hidden sm:inline text-sm text-gray-400">|</span>
          <span className="hidden sm:inline text-sm font-medium text-[#0056B8]">Leilao Corporativo</span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex gap-4 text-sm">
            <Link href="/leiloes" className="text-gray-600 hover:text-[#0056B8] transition-colors">
              Leiloes
            </Link>
          </nav>

          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-[#0056B8] text-white px-4 py-1.5 rounded-lg hover:bg-[#003A78] transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

# Leilao - Grupo Unico

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

Sistema de leilao desenvolvido para o Grupo Unico. Aplicacao fullstack com painel administrativo (Next.js) e interface do leiloeiro (React + Vite).

## Arquitetura

O projeto e composto por dois modulos:

| Modulo | Stack | Descricao |
|--------|-------|-----------|
| `web/` | Next.js 15, Prisma, NextAuth, Tailwind CSS | Painel administrativo com autenticacao, gerenciamento de lotes e banco de dados |
| `web-vite/` | React 19, Vite 7, Axios, Tailwind CSS | Interface do leiloeiro para conducao dos leiloes em tempo real |

## Funcionalidades

- Autenticacao de usuarios com NextAuth
- Gerenciamento de lotes e itens de leilao
- Interface em tempo real para o leiloeiro
- Banco de dados PostgreSQL com Prisma ORM
- Seed de dados para desenvolvimento
- Importacao de dados via XLSX

## Pre-requisitos

- Node.js 18+
- PostgreSQL

## Como executar

### Painel Administrativo (web)

```bash
cd web
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Acesse: `http://localhost:3000`

### Interface do Leiloeiro (web-vite)

```bash
cd web-vite
npm install
npm run dev
```

## Variaveis de Ambiente

Crie um arquivo `.env` na pasta `web/` com base no `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leilao_unico?schema=public"
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_ORIGIN="http://localhost:5173"
```

## Scripts Disponiveis

### web/
| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de producao |
| `npm run db:migrate` | Executa migracoes do Prisma |
| `npm run db:seed` | Popula banco com dados iniciais |
| `npm run db:studio` | Abre Prisma Studio |

### web-vite/
| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run preview` | Preview do build |

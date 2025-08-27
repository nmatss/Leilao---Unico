import { NextResponse } from "next/server";

const MOCK_LEILOES = [
	{ id: "1", titulo: "Notebook Gamer", lanceAtual: 3500, encerramento: "2025-09-30T20:00:00Z" },
	{ id: "2", titulo: "Smartphone Top", lanceAtual: 2800, encerramento: "2025-09-28T18:00:00Z" },
	{ id: "3", titulo: "TV 65\" 4K", lanceAtual: 4200, encerramento: "2025-10-02T21:00:00Z" },
];

export async function GET() {
	return NextResponse.json({ itens: MOCK_LEILOES });
} 
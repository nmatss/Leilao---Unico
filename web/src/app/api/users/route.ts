import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const VALID_ROLES = ["admin", "employee", "financeiro", "ti"];

interface UserInput {
  cpf: string;
  name: string;
  email: string;
  password: string;
  department?: string;
  role?: string;
}

function validate(u: UserInput): string | null {
  if (!u.cpf || !u.name || !u.email || !u.password) {
    return "cpf, name, email e password sao obrigatorios";
  }
  const cpf = u.cpf.replace(/\D/g, "");
  if (cpf.length !== 11) return "CPF deve ter 11 digitos";
  if (u.role && !VALID_ROLES.includes(u.role)) {
    return `role invalido: ${u.role}`;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const user = session.user as { role?: string };
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await req.json();

  // Individual
  if (body.user) {
    const input = body.user as UserInput;
    const err = validate(input);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }

    const cpf = input.cpf.replace(/\D/g, "");
    const hashed = await bcrypt.hash(input.password, 10);

    try {
      await prisma.user.create({
        data: {
          cpf,
          name: input.name,
          email: input.email,
          password: hashed,
          department: input.department || null,
          role: input.role || "employee",
        },
      });
      return NextResponse.json({ created: 1, errors: [] }, { status: 201 });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Erro desconhecido";
      if (message.includes("Unique")) {
        return NextResponse.json(
          { error: "CPF ou email ja cadastrado" },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Bulk
  if (body.users && Array.isArray(body.users)) {
    const inputs = body.users as UserInput[];
    let created = 0;
    const errors: { cpf: string; message: string }[] = [];

    for (const input of inputs) {
      const err = validate(input);
      if (err) {
        errors.push({ cpf: input.cpf || "?", message: err });
        continue;
      }

      const cpf = input.cpf.replace(/\D/g, "");
      try {
        const hashed = await bcrypt.hash(input.password, 10);
        await prisma.user.create({
          data: {
            cpf,
            name: input.name,
            email: input.email,
            password: hashed,
            department: input.department || null,
            role: input.role || "employee",
          },
        });
        created++;
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Erro desconhecido";
        errors.push({
          cpf,
          message: message.includes("Unique")
            ? "CPF ou email ja cadastrado"
            : message,
        });
      }
    }

    return NextResponse.json({ created, errors }, { status: 201 });
  }

  return NextResponse.json(
    { error: "Envie { user: {...} } ou { users: [...] }" },
    { status: 400 },
  );
}

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UsersClient } from "./components/UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      cpf: true,
      name: true,
      email: true,
      department: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string })?.role || "employee";

  const serialized = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return <UsersClient users={serialized} userRole={userRole} />;
}

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/leilao_unico?schema=public";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const employeePassword = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { cpf: "00000000000" },
    update: {},
    create: {
      cpf: "00000000000",
      name: "Admin",
      email: "admin@grupounico.com",
      password: adminPassword,
      department: "TI",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { cpf: "11111111111" },
    update: {},
    create: {
      cpf: "11111111111",
      name: "Joao Silva",
      email: "joao.silva@grupounico.com",
      password: employeePassword,
      department: "Comercial",
      role: "employee",
    },
  });

  console.log("Seed completed: 2 users created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

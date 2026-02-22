import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ItemForm from "../../components/ItemForm";

export const dynamic = "force-dynamic";

function toLocalDatetime(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default async function EditarItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) notFound();

  let photos: string[] = [];
  try {
    photos = JSON.parse(item.photos);
  } catch {
    photos = [];
  }

  const initialData = {
    id: item.id,
    title: item.title,
    description: item.description,
    condition: item.condition,
    startingPrice: item.startingPrice,
    startDate: toLocalDatetime(item.startDate),
    endDate: toLocalDatetime(item.endDate),
    status: item.status,
    photos,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Item</h1>
      <ItemForm initialData={initialData} />
    </div>
  );
}

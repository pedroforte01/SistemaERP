import { getClienteById } from "../../data";
import EditarClienteForm from "./EditarClienteForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await getClienteById(id);

  if (!cliente) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-8 py-5 flex items-center gap-4">
        <Link
          href="/clientes"
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          ← Voltar
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Editar Cliente
        </h1>
      </header>

      <main className="flex-1 px-8 py-8">
        <EditarClienteForm cliente={cliente} />
      </main>
    </div>
  );
}
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLancamento } from "../../data";
import EditarLancamentoForm from "./EditarLancamentoForm";

export default async function EditarLancamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNumero = Number(id);
  if (!Number.isInteger(idNumero)) notFound();

  const lancamento = await getLancamento(idNumero);
  if (!lancamento) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-8 py-5 flex items-center gap-4">
        <Link
          href="/lancamentos"
          className="text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          ← Voltar
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Editar Lançamento
        </h1>
      </header>

      <div className="flex-1 px-8 py-8">
        <EditarLancamentoForm lancamento={lancamento} />
      </div>
    </div>
  );
}
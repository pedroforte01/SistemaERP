"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AcoesCliente({ id }: { id: number }) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);

  async function handleConfirmarExclusao() {
    await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    setModalAberto(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-3">
        <Link
          href={`/clientes/${id}/editar`}
          className="text-accent text-xs font-medium hover:underline"
        >
          Editar
        </Link>
        <button
          onClick={() => setModalAberto(true)}
          className="text-danger text-xs font-medium hover:underline"
        >
          Excluir
        </button>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg border border-border p-6 max-w-sm w-full mx-4">
            <h2 className="text-base font-semibold text-foreground mb-2">
              Excluir cliente
            </h2>
            <p className="text-sm text-foreground/70 mb-6">
              Tem certeza que deseja excluir esse cliente? Essa ação não pode
              ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalAberto(false)}
                className="text-sm font-medium text-foreground/70 px-4 py-2 rounded-md hover:bg-background transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                className="bg-danger text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
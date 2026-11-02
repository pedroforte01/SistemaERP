"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AlternarMensal({
  id,
  ligado,
}: {
  id: number;
  ligado: boolean;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(ligado);
  const [salvando, setSalvando] = useState(false);

  async function alternar() {
    const novo = !valor;
    setValor(novo);
    setSalvando(true);

    try {
      const res = await fetch(`/api/alunos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cobranca_mensal: novo }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setValor(!novo); // não salvou: volta ao que estava
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={valor}
        aria-label="Cobrança mensal automática"
        disabled={salvando}
        onClick={alternar}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          valor ? "bg-accent" : "bg-border"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            valor ? "translate-x-5" : ""
          }`}
        />
      </button>
      <span className="text-xs text-muted">{valor ? "Automática" : "Manual"}</span>
    </div>
  );
}
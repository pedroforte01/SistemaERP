"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovoClientePage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState("ativo");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, documento, email, telefone, status }),
    });

    router.refresh();
    router.push("/clientes");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-8 py-5 flex items-center gap-4">
        <Link href="/clientes" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
          ← Voltar
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Novo Cliente</h1>
      </header>

      <main className="flex-1 px-8 py-8">
        <form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">Nome</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">Documento</label>
            <input type="text" value={documento} onChange={(e) => setDocumento(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">Telefone</label>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm">
              <option value="ativo">Ativo</option>
              <option value="inadimplente">Inadimplente</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <button type="submit" className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity mt-2 self-start">
            Salvar
          </button>
        </form>
      </main>
    </div>
  );
}
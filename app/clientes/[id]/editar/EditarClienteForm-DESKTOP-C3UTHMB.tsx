"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Aluno } from "../../data";

export default function EditarAlunoForm({ aluno }: { aluno: Aluno }) {
  const router = useRouter();

  const [nome, setNome] = useState(aluno.nome);
  const [documento, setDocumento] = useState(aluno.documento);
  const [email, setEmail] = useState(aluno.email);
  const [telefone, setTelefone] = useState(aluno.telefone);
  const [status, setStatus] = useState(aluno.status);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await fetch(`/api/alunos/${aluno.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, documento, email, telefone, status }),
    });

    router.refresh();
    router.push("/alunos");
  }

  return (
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
        Salvar alterações
      </button>
    </form>
  );
}
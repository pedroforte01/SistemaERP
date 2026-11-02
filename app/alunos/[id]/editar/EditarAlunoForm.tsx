"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Aluno } from "../../data";
import { formatarData } from "@/lib/periodo";

const campo = "w-full border border-border rounded-md px-3 py-2 text-sm";
const rotulo = "block text-sm font-medium text-foreground/70 mb-1";

export default function EditarAlunoForm({ aluno }: { aluno: Aluno }) {
  const router = useRouter();

  const [nome, setNome] = useState(aluno.nome);
  const [documento, setDocumento] = useState(aluno.documento);
  const [email, setEmail] = useState(aluno.email);
  const [telefone, setTelefone] = useState(aluno.telefone);
  const [status, setStatus] = useState(aluno.status);
  const [dataMatricula, setDataMatricula] = useState(
    aluno.data_matricula || formatarData(new Date())
  );
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro("");
    setSalvando(true);

    try {
      const res = await fetch(`/api/alunos/${aluno.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          documento,
          email,
          telefone,
          status,
          data_matricula: dataMatricula,
        }),
      });

      if (!res.ok) {
        const dados = await res.json().catch(() => null);
        setErro(dados?.erro ?? "Não foi possível salvar as alterações.");
        setSalvando(false);
        return;
      }

      router.refresh();
      router.push("/alunos");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-4">
      <div>
        <label className={rotulo}>Nome</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className={campo} />
      </div>

      <div>
        <label className={rotulo}>Documento</label>
        <input type="text" value={documento} onChange={(e) => setDocumento(e.target.value)} className={campo} />
      </div>

      <div>
        <label className={rotulo}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={campo} />
      </div>

      <div>
        <label className={rotulo}>Telefone</label>
        <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} className={campo} />
      </div>

      <div>
        <label className={rotulo}>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Aluno["status"])}
          className={campo}
        >
          <option value="ativo">Ativo</option>
          <option value="inadimplente">Inadimplente</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      <div>
        <label className={rotulo}>Data da matrícula</label>
        <input
          type="date"
          value={dataMatricula}
          max={formatarData(new Date())}
          onChange={(e) => setDataMatricula(e.target.value)}
          className={campo}
          required
        />
        <p className="mt-1 text-xs text-muted">
          Quando o aluno entrou na academia. É usada no crescimento do dashboard.
        </p>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <button
        type="submit"
        disabled={salvando}
        className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity mt-2 self-start disabled:opacity-50"
      >
        {salvando ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
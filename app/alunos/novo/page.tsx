"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatarData } from "@/lib/periodo";

const campo = "w-full border border-border rounded-md px-3 py-2 text-sm";
const rotulo = "block text-sm font-medium text-foreground/70 mb-1";

export default function NovoAlunoPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState("ativo");
  const [cobrancaMensal, setCobrancaMensal] = useState(true);
  const [dataMatricula, setDataMatricula] = useState(() => formatarData(new Date()));
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro("");
    setSalvando(true);

    try {
      const res = await fetch("/api/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          documento,
          email,
          telefone,
          status,
          data_matricula: dataMatricula,
          cobranca_mensal: cobrancaMensal,
        }),
      });

      if (!res.ok) {
        const dados = await res.json().catch(() => null);
        setErro(dados?.erro ?? "Não foi possível cadastrar o aluno.");
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
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-8 py-5 flex items-center gap-4">
        <Link href="/alunos" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
          ← Voltar
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Novo Aluno</h1>
      </header>

      <div className="flex-1 px-8 py-8">
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
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={campo}>
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

          <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-card p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Cobrança mensal automática</p>
              <p className="text-xs text-muted">
                O sistema lança a mensalidade deste aluno todo mês, como Pendente.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={cobrancaMensal}
              onClick={() => setCobrancaMensal((atual) => !atual)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                cobrancaMensal ? "bg-accent" : "bg-border"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  cobrancaMensal ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
          
          {erro && <p className="text-sm text-danger">{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity mt-2 self-start disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}
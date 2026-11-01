"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Aluno = {
  id: number;
  nome: string;
  status: string;
};

type Atalho = {
  nome: string;
};

const campo = "w-full border border-border rounded-md px-3 py-2 text-sm";
const rotulo = "block text-sm font-medium text-foreground/70 mb-1";

export default function NovoLancamentoPage() {
  const router = useRouter();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [atalhos, setAtalhos] = useState<Atalho[]>([]);
  const [alunoId, setAlunoId] = useState("");
  const [tipo, setTipo] = useState("receber");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [status, setStatus] = useState("pendente");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/alunos")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: Aluno[]) =>
        setAlunos(data.filter((a) => a.status !== "inativo"))
      )
      .catch(() => setErro("Não foi possível carregar a lista de alunos."));
  }, []);

  useEffect(() => {
    fetch(`/api/descricoes?tipo=${tipo}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setAtalhos)
      .catch(() => setAtalhos([]));
  }, [tipo]);

  function trocarTipo(novoTipo: string) {
    setTipo(novoTipo);
    setDescricao("");
    if (novoTipo === "pagar") setAlunoId("");
  }

  const descricaoLimpa = descricao.trim();
  const jaEhAtalho = atalhos.some(
    (a) => a.nome.toLowerCase() === descricaoLimpa.toLowerCase()
  );

  async function handleSalvarAtalho() {
    setErro("");
    const res = await fetch("/api/descricoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: descricaoLimpa, tipo }),
    });
    if (!res.ok) {
      setErro("Não foi possível salvar o atalho.");
      return;
    }
    setAtalhos((anteriores) =>
      [...anteriores, { nome: descricaoLimpa }].sort((a, b) =>
        a.nome.localeCompare(b.nome)
      )
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro("");
    setSalvando(true);

    try {
      const res = await fetch("/api/lancamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aluno_id: tipo === "receber" && alunoId ? Number(alunoId) : null,
          tipo,
          valor: Number(valor),
          vencimento,
          status,
          descricao: descricaoLimpa || null,
        }),
      });

      if (!res.ok) {
        const dados = await res.json().catch(() => null);
        setErro(dados?.erro ?? "Não foi possível salvar o lançamento.");
        setSalvando(false);
        return;
      }

      router.refresh();
      router.push("/lancamentos");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setSalvando(false);
    }
  }

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
          Novo Lançamento
        </h1>
      </header>

      <div className="flex-1 px-8 py-8">
        <form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-4">
          <div>
            <label className={rotulo}>Tipo</label>
            <select
              value={tipo}
              onChange={(e) => trocarTipo(e.target.value)}
              className={campo}
            >
              <option value="receber">Receita (entrada)</option>
              <option value="pagar">Despesa (saída)</option>
            </select>
          </div>

          {tipo === "receber" && (
            <div>
              <label className={rotulo}>Aluno (opcional)</label>
              <select
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
                className={campo}
              >
                <option value="">Sem aluno</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={rotulo}>Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={100}
              placeholder={
                tipo === "receber" ? "Ex.: Mensalidade, Kimono" : "Ex.: Aluguel, Luz"
              }
              className={campo}
            />

            {atalhos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {atalhos.map((a) => (
                  <button
                    key={a.nome}
                    type="button"
                    onClick={() => setDescricao(a.nome)}
                    className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                      descricaoLimpa === a.nome
                        ? "bg-accent text-white border-accent"
                        : "border-border text-foreground/70 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {a.nome}
                  </button>
                ))}
              </div>
            )}

            {descricaoLimpa && !jaEhAtalho && (
              <button
                type="button"
                onClick={handleSalvarAtalho}
                className="mt-2 text-xs font-medium text-accent hover:underline"
              >
                {`+ Salvar "${descricaoLimpa}" como atalho`}
              </button>
            )}
          </div>

          <div>
            <label className={rotulo}>Valor</label>
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className={campo}
              required
            />
          </div>

          <div>
            <label className={rotulo}>Vencimento</label>
            <input
              type="date"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              className={campo}
              required
            />
          </div>

          <div>
            <label className={rotulo}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={campo}
            >
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
            </select>
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
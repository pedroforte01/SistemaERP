import Link from "next/link";
import { getLancamentos } from "./data";
import AcoesLancamento from "./AcoesLancamento";

export default async function LancamentosPage() {
  const lancamentos = await getLancamentos();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            ← Voltar
          </Link>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Finanças
          </h1>
        </div>
        <Link
          href="/lancamentos/novo"
          className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          Novo Lançamento
        </Link>
      </header>

      <div className="flex-1 px-8 py-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-foreground/60 border-b border-border">
              <th className="py-2 pr-4">Aluno</th>
              <th className="py-2 pr-4">Descrição</th>
              <th className="py-2 pr-4">Tipo</th>
              <th className="py-2 pr-4">Valor</th>
              <th className="py-2 pr-4">Vencimento</th>
              <th className="py-2 pr-4">Pago em</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((l) => (
              <tr key={l.id} className="border-b border-border/50">
                <td className="py-2 pr-4">{l.aluno_nome ?? "—"}</td>
                <td className="py-2 pr-4">{l.descricao ?? "—"}</td>
                <td className="py-2 pr-4">
                  {l.tipo === "receber" ? "Receita" : "Despesa"}
                </td>
                <td className="py-2 pr-4">R$ {l.valor.toFixed(2)}</td>
                <td className="py-2 pr-4">
                  {l.vencimento ? new Date(l.vencimento + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                </td>
                <td className="py-2 pr-4">
                  {l.pago_em ? new Date(l.pago_em + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                </td>
                <td className="py-2 pr-4">
                  {(() => {
                    const atrasado = l.status === "pendente" && l.vencimento && new Date(l.vencimento) < new Date();
                    const badgeStyle: Record<string, string> = {
                      pago: "text-success bg-success/10",
                      pendente: "text-yellow-600 bg-yellow-100",
                    };
                    const label = atrasado ? "Atrasado" : l.status;
                    const style = atrasado ? "text-danger bg-danger/10" : badgeStyle[l.status];
                    return (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${style}`}>
                        {label}
                      </span>
                    );
                  })()}
                </td>
                <td className="py-2 pr-4">
                  <AcoesLancamento lancamento={l} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import Link from "next/link";
import { getClientes } from "./data";
import AcoesCliente from "./AcoesCliente";

export default async function ClientesPage() {
  const clientes = await getClientes();
  const total = clientes.length;
  const ativos = clientes.filter((c) => c.status === "ativo").length;
  const inadimplentes = clientes.filter((c) => c.status === "inadimplente").length;
  const inativos = clientes.filter((c) => c.status === "inativo").length;

  const badgeStyle: Record<string, string> = {
    ativo: "text-success bg-success/10",
    inadimplente: "text-yellow-600 bg-yellow-100",
    inativo: "text-danger bg-danger/10",
  };

  const badgeLabel: Record<string, string> = {
    ativo: "Ativo",
    inadimplente: "Inadimplente",
    inativo: "Inativo",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
            ← Voltar
          </Link>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Clientes</h1>
        </div>
        <Link
          href="/clientes/novo"
          className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          + Novo Cliente
        </Link>
      </header>

      <main className="flex-1 px-8 py-8">
        <div className="flex gap-4 mb-8">
          <div className="border border-border rounded-lg px-5 py-4 bg-white min-w-[140px]">
            <p className="text-xs text-foreground/60 mb-1">Total</p>
            <p className="text-2xl font-semibold text-foreground">{total}</p>
          </div>
          <div className="border border-border rounded-lg px-5 py-4 bg-white min-w-[140px]">
            <p className="text-xs text-foreground/60 mb-1">Ativos</p>
            <p className="text-2xl font-semibold text-success">{ativos}</p>
          </div>
          <div className="border border-border rounded-lg px-5 py-4 bg-white min-w-[140px]">
            <p className="text-xs text-foreground/60 mb-1">Inadimplentes</p>
            <p className="text-2xl font-semibold text-yellow-600">{inadimplentes}</p>
          </div>
          <div className="border border-border rounded-lg px-5 py-4 bg-white min-w-[140px]">
            <p className="text-xs text-foreground/60 mb-1">Inativos</p>
            <p className="text-2xl font-semibold text-danger">{inativos}</p>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-foreground/70">Nome</th>
                <th className="px-4 py-3 font-medium text-foreground/70">Documento</th>
                <th className="px-4 py-3 font-medium text-foreground/70">Email</th>
                <th className="px-4 py-3 font-medium text-foreground/70">Telefone</th>
                <th className="px-4 py-3 font-medium text-foreground/70">Status</th>
                <th className="px-4 py-3 font-medium text-foreground/70">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-border last:border-0 hover:bg-background transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{cliente.nome}</td>
                  <td className="px-4 py-3 text-foreground/70">{cliente.documento}</td>
                  <td className="px-4 py-3 text-foreground/70">{cliente.email}</td>
                  <td className="px-4 py-3 text-foreground/70">{cliente.telefone}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeStyle[cliente.status]}`}>
                      {badgeLabel[cliente.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AcoesCliente id={cliente.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
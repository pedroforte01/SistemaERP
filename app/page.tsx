import Link from "next/link";

const modulos = [
  {
    nome: "Alunos",
    descricao: "Cadastro, status e saldo pendente",
    href: "/alunos",
  },
  {
    nome: "Finanças",
    descricao: "Lançamentos a pagar e a receber",
    href: "/lancamentos",
  },
  {
    nome: "Dashboard",
    descricao: "Indicadores e visão geral do negócio",
    href: "/dashboard",
  },
];

export default function Home() {
  return (
    <div className="px-8 py-12">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">
        Início
      </h1>
      <p className="mb-8 text-sm text-foreground/60">
        Selecione um módulo para começar
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {modulos.map((modulo) => (
          <Link
            key={modulo.href}
            href={modulo.href}
            className="border border-border rounded-lg p-6 bg-white hover:border-accent transition-colors"
          >
            <h2 className="text-base font-semibold text-foreground mb-1">
              {modulo.nome}
            </h2>
            <p className="text-sm text-foreground/60">{modulo.descricao}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
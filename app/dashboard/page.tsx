import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  CalendarX,
} from "lucide-react";
import CardMetrica from "@/components/CardMetrica";
import CardGrafico from "@/components/CardGrafico";
import FiltroPeriodo from "@/components/FiltroPeriodo";
import { dataBR, lerPeriodo, periodoAnterior } from "@/lib/periodo";
import {
  getTotalAlunos,
  getAlunosAtivos,
  getAlunosInativos,
  getAlunosInadimplentes,
  getCrescimentoAlunosPeriodo,
  getResumoFinanceiro,
} from "@/lib/metricas";

const brl = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  const periodo = lerPeriodo(await searchParams);
  const anterior = periodoAnterior(periodo);

  const [total, ativos, inativos, inadimplentes, crescimento, fin] =
    await Promise.all([
      getTotalAlunos(),
      getAlunosAtivos(),
      getAlunosInativos(),
      getAlunosInadimplentes(),
      getCrescimentoAlunosPeriodo(periodo, anterior),
      getResumoFinanceiro(periodo),
    ]);

  const cresceu = crescimento.percentual >= 0;
  const saldo = fin.recebido - fin.pago;
  const projetado = fin.recebido + fin.aReceber - fin.pago - fin.aPagar;

  return (
    <div className="px-8 py-8 max-w-6xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted">
            {dataBR(periodo.de)} a {dataBR(periodo.ate)}
          </p>
        </div>
        <FiltroPeriodo
          key={`${periodo.de}_${periodo.ate}`}
          de={periodo.de}
          ate={periodo.ate}
        />
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted">
        Alunos{" "}
        <span className="font-normal">· situação de hoje, exceto o crescimento</span>
      </h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetrica
          rotulo="Alunos Ativos"
          valor={ativos}
          icone={UserCheck}
          tom="success"
          detalhe={`de ${total} alunos no total`}
        />
        <CardMetrica
          rotulo="Inadimplentes"
          valor={inadimplentes}
          icone={Users}
          tom={inadimplentes > 0 ? "danger" : "success"}
        />
        <CardMetrica
          rotulo="Alunos Inativos"
          valor={inativos}
          icone={UserX}
          tom="neutro"
        />
        <CardMetrica
          rotulo="Crescimento no período"
          valor={`${cresceu ? "+" : ""}${crescimento.percentual.toFixed(1)}%`}
          icone={cresceu ? TrendingUp : TrendingDown}
          tom={cresceu ? "success" : "danger"}
          detalhe={`${crescimento.atual} no período vs ${crescimento.anterior} no anterior`}
        />
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted">
        Financeiro{" "}
        <span className="font-normal">
          · {dataBR(periodo.de)} a {dataBR(periodo.ate)}
        </span>
      </h2>

      <p className="mb-2 text-xs text-muted">Realizado no período</p>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardMetrica
          rotulo="Receita recebida"
          valor={brl(fin.recebido)}
          icone={TrendingUp}
          tom="success"
          detalhe="Pagamentos recebidos no período"
        />
        <CardMetrica
          rotulo="Despesas pagas"
          valor={brl(fin.pago)}
          icone={TrendingDown}
          tom="neutro"
          detalhe="Despesas pagas no período"
        />
        <CardMetrica
          rotulo="Saldo do período"
          valor={brl(saldo)}
          icone={Wallet}
          tom={saldo >= 0 ? "success" : "danger"}
          detalhe="Recebido menos pago"
        />
      </div>

      <p className="mb-2 text-xs text-muted">Previsto para vencer no período</p>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardMetrica
          rotulo="A receber no período"
          valor={brl(fin.aReceber)}
          icone={Clock}
          tom="warning"
          detalhe="Pendente com vencimento no período"
        />
        <CardMetrica
          rotulo="A pagar no período"
          valor={brl(fin.aPagar)}
          icone={Clock}
          tom={fin.aPagar > 0 ? "danger" : "success"}
          detalhe="Pendente com vencimento no período"
        />
        <CardMetrica
          rotulo="Resultado projetado"
          valor={brl(projetado)}
          icone={projetado >= 0 ? TrendingUp : TrendingDown}
          tom={projetado >= 0 ? "success" : "danger"}
          detalhe="Se tudo que vence no período for quitado"
        />
      </div>

      <p className="mb-2 text-xs text-muted">Em aberto (independe do período)</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CardMetrica
          rotulo="Receitas em atraso"
          valor={brl(fin.emAtrasoReceber)}
          icone={CalendarX}
          tom={fin.emAtrasoReceber > 0 ? "danger" : "success"}
          detalhe="A receber já vencido"
        />
        <CardMetrica
          rotulo="Despesas em atraso"
          valor={brl(fin.emAtrasoPagar)}
          icone={CalendarX}
          tom={fin.emAtrasoPagar > 0 ? "danger" : "success"}
          detalhe="A pagar já vencido"
        />
        <CardMetrica
          rotulo="Despesas em aberto"
          valor={brl(fin.emAbertoPagar)}
          icone={Clock}
          tom={fin.emAbertoPagar > 0 ? "danger" : "success"}
          detalhe="Tudo que falta pagar, de qualquer data"
        />
      </div>

      <h2 className="mb-3 mt-8 text-sm font-medium text-muted">Gráficos</h2>
      <CardGrafico de={periodo.de} ate={periodo.ate} />
    </div>
  );
}
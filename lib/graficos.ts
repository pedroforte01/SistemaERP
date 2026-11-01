import pool from "./db";
import type { DadoId, DadosGrafico } from "./graficos-catalogo";
import { formatarData, type Periodo } from "./periodo";

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

// Divide o período em "baldes": um por dia (até 31 dias) ou um por mês.
function gerarBaldes(p: Periodo) {
  const [a1, m1, d1] = p.de.split("-").map(Number);
  const [a2, m2, d2] = p.ate.split("-").map(Number);
  const inicio = new Date(a1, m1 - 1, d1);
  const fim = new Date(a2, m2 - 1, d2);
  const dias = Math.round((fim.getTime() - inicio.getTime()) / 86400000) + 1;
  const porDia = dias <= 31;

  const baldes: { chave: string; rotulo: string }[] = [];

  if (porDia) {
    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      const chave = formatarData(d);
      baldes.push({ chave, rotulo: `${chave.slice(8)}/${chave.slice(5, 7)}` });
    }
  } else {
    for (
      let d = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
      d <= fim;
      d.setMonth(d.getMonth() + 1)
    ) {
      const chave = formatarData(d).slice(0, 7);
      baldes.push({
        chave,
        rotulo: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      });
    }
  }

  return { porDia, baldes };
}

async function receitaDespesa(p: Periodo): Promise<DadosGrafico> {
  const { porDia, baldes } = gerarBaldes(p);
  const formato = porDia ? "YYYY-MM-DD" : "YYYY-MM";

  const result = await pool.query(
    `SELECT
       to_char(pago_em, $3::text) AS chave,
       COALESCE(SUM(valor) FILTER (WHERE tipo = 'receber'), 0) AS receita,
       COALESCE(SUM(valor) FILTER (WHERE tipo = 'pagar'), 0) AS despesa
     FROM lancamentos
     WHERE status = 'pago'
       AND pago_em BETWEEN $1::date AND $2::date
     GROUP BY 1`,
    [p.de, p.ate, formato]
  );

  const porChave = new Map(result.rows.map((r) => [r.chave as string, r]));

  // Todo balde aparece no gráfico, mesmo sem movimento (valor zero).
  const pontos = baldes.map((b) => {
    const linha = porChave.get(b.chave);
    return {
      rotulo: b.rotulo,
      receita: linha ? Number(linha.receita) : 0,
      despesa: linha ? Number(linha.despesa) : 0,
    };
  });

  return {
    series: [
      { chave: "receita", nome: "Receita", cor: "#0d9488" },
      { chave: "despesa", nome: "Despesa", cor: "#d97706" },
    ],
    pontos,
  };
}

const PALETA = ["#0d9488", "#2563eb", "#d97706", "#7c3aed", "#db2777", "#65a30d"];
const MAX_FATIAS = 6;

// Soma o que foi pago, agrupado pela descrição do lançamento.
// Mostra as 6 maiores e junta o resto em "Outros".
async function porDescricao(
  tipo: "receber" | "pagar",
  nomeSerie: string,
  p: Periodo
): Promise<DadosGrafico> {
  const result = await pool.query(
    `SELECT
       COALESCE(NULLIF(TRIM(descricao), ''), 'Sem descrição') AS rotulo,
       SUM(valor) AS valor
     FROM lancamentos
     WHERE tipo = $1
       AND status = 'pago'
       AND pago_em BETWEEN $2::date AND $3::date
     GROUP BY 1
     ORDER BY 2 DESC`,
    [tipo, p.de, p.ate]
  );

  const linhas = result.rows.map((r) => ({
    rotulo: r.rotulo as string,
    valor: Number(r.valor),
  }));
  const principais = linhas.slice(0, MAX_FATIAS);
  const resto = linhas.slice(MAX_FATIAS).reduce((soma, l) => soma + l.valor, 0);

  const pontos = principais.map((l, i) => ({
    rotulo: l.rotulo,
    valor: l.valor,
    cor: PALETA[i % PALETA.length],
  }));
  if (resto > 0) pontos.push({ rotulo: "Outros", valor: resto, cor: "#9ca3af" });

  return {
    series: [{ chave: "valor", nome: nomeSerie, cor: "#0d9488" }],
    pontos,
  };
}

const STATUS_ALUNO: Record<string, { rotulo: string; cor: string }> = {
  ativo: { rotulo: "Ativos", cor: "#059669" },
  inadimplente: { rotulo: "Inadimplentes", cor: "#dc2626" },
  inativo: { rotulo: "Inativos", cor: "#9ca3af" },
};

// Situação de hoje: o banco não guarda o histórico de status.
async function alunosPorStatus(): Promise<DadosGrafico> {
  const result = await pool.query(
    `SELECT status, COUNT(*) AS total FROM alunos GROUP BY status`
  );
  const contagem = new Map(
    result.rows.map((r) => [r.status as string, Number(r.total)])
  );

  const pontos = Object.entries(STATUS_ALUNO).map(([status, info]) => ({
    rotulo: info.rotulo,
    valor: contagem.get(status) ?? 0,
    cor: info.cor,
  }));

  return {
    series: [{ chave: "valor", nome: "Alunos", cor: "#0d9488" }],
    pontos,
  };
}

const BUSCAS: Record<DadoId, (p: Periodo) => Promise<DadosGrafico>> = {
  receita_despesa: receitaDespesa,
  receita_descricao: (p) => porDescricao("receber", "Receita", p),
  despesa_descricao: (p) => porDescricao("pagar", "Despesa", p),
  alunos_status: () => alunosPorStatus(),
};

export async function buscarDados(
  dado: DadoId,
  periodo: Periodo
): Promise<DadosGrafico> {
  return BUSCAS[dado](periodo);
}
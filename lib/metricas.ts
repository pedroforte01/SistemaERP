import pool from "./db";
import type { Periodo } from "./periodo";

export async function getTotalAlunos(): Promise<number> {
  const result = await pool.query("SELECT COUNT(*) FROM alunos");
  return Number(result.rows[0].count);
}

export async function getAlunosAtivos(): Promise<number> {
  const result = await pool.query(
    "SELECT COUNT(*) FROM alunos WHERE status = 'ativo'"
  );
  return Number(result.rows[0].count);
}

export async function getAlunosInativos(): Promise<number> {
  const result = await pool.query(
    "SELECT COUNT(*) FROM alunos WHERE status = 'inativo'"
  );
  return Number(result.rows[0].count);
}

export async function getAlunosInadimplentes(): Promise<number> {
  const result = await pool.query(
    "SELECT COUNT(*) FROM alunos WHERE status = 'inadimplente'"
  );
  return Number(result.rows[0].count);
}

export async function getCrescimentoAlunosMes(): Promise<{
  atual: number;
  anterior: number;
  percentual: number;
}> {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (
        WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
      ) AS atual,
      COUNT(*) FILTER (
        WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
      ) AS anterior
    FROM alunos
  `);
  const atual = Number(result.rows[0].atual);
  const anterior = Number(result.rows[0].anterior);
  const percentual = anterior === 0 ? 0 : ((atual - anterior) / anterior) * 100;
  return { atual, anterior, percentual };
}

export async function getSaldoMensal(): Promise<number> {
  const result = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN tipo = 'receber' THEN valor ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN tipo = 'pagar' THEN valor ELSE 0 END), 0) AS saldo
    FROM lancamentos
    WHERE status = 'pago'
      AND date_trunc('month', pago_em) = date_trunc('month', CURRENT_DATE)
  `);
  return Number(result.rows[0].saldo);
}

export async function getPendenteReceber(): Promise<number> {
  const result = await pool.query(`
    SELECT COALESCE(SUM(valor), 0) AS total
    FROM lancamentos
    WHERE tipo = 'receber' AND status = 'pendente'
  `);
  return Number(result.rows[0].total);
}

export async function getPendentePagar(): Promise<number> {
  const result = await pool.query(`
    SELECT COALESCE(SUM(valor), 0) AS total
    FROM lancamentos
    WHERE tipo = 'pagar' AND status = 'pendente'
  `);
  return Number(result.rows[0].total);
}

export async function getCrescimentoAlunosPeriodo(
  atual: Periodo,
  anterior: Periodo
): Promise<{ atual: number; anterior: number; percentual: number }> {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (
         WHERE data_matricula BETWEEN $1::date AND $2::date
       ) AS atual,
       COUNT(*) FILTER (
         WHERE data_matricula BETWEEN $3::date AND $4::date
       ) AS anterior
     FROM alunos`,
    [atual.de, atual.ate, anterior.de, anterior.ate]
  );
  const qtdAtual = Number(result.rows[0].atual);
  const qtdAnterior = Number(result.rows[0].anterior);
  const percentual =
    qtdAnterior === 0 ? 0 : ((qtdAtual - qtdAnterior) / qtdAnterior) * 100;
  return { atual: qtdAtual, anterior: qtdAnterior, percentual };
}

export async function getResumoFinanceiro(p: Periodo): Promise<{
  recebido: number;
  pago: number;
  aReceber: number;
  aPagar: number;
  emAtrasoReceber: number;
  emAtrasoPagar: number;
  emAbertoPagar: number;
}> {
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(valor) FILTER (
         WHERE tipo = 'receber' AND status = 'pago'
           AND pago_em BETWEEN $1::date AND $2::date
       ), 0) AS recebido,
       COALESCE(SUM(valor) FILTER (
         WHERE tipo = 'pagar' AND status = 'pago'
           AND pago_em BETWEEN $1::date AND $2::date
       ), 0) AS pago,
       COALESCE(SUM(valor) FILTER (
         WHERE tipo = 'receber' AND status = 'pendente'
           AND vencimento BETWEEN $1::date AND $2::date
       ), 0) AS a_receber,
       COALESCE(SUM(valor) FILTER (
         WHERE tipo = 'pagar' AND status = 'pendente'
           AND vencimento BETWEEN $1::date AND $2::date
       ), 0) AS a_pagar,
       COALESCE(SUM(valor) FILTER (
         WHERE tipo = 'receber' AND status = 'pendente'
           AND vencimento < CURRENT_DATE
       ), 0) AS em_atraso_receber,
       COALESCE(SUM(valor) FILTER (
         WHERE tipo = 'pagar' AND status = 'pendente'
           AND vencimento < CURRENT_DATE
       ), 0) AS em_atraso_pagar,
       COALESCE(SUM(valor) FILTER (
         WHERE tipo = 'pagar' AND status = 'pendente'
       ), 0) AS em_aberto_pagar
     FROM lancamentos`,
    [p.de, p.ate]
  );
  const linha = result.rows[0];
  return {
    recebido: Number(linha.recebido),
    pago: Number(linha.pago),
    aReceber: Number(linha.a_receber),
    aPagar: Number(linha.a_pagar),
    emAtrasoReceber: Number(linha.em_atraso_receber),
    emAtrasoPagar: Number(linha.em_atraso_pagar),
    emAbertoPagar: Number(linha.em_aberto_pagar),
  };
}
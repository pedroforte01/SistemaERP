import pool from "@/lib/db";

export type Lancamento = {
  id: number;
  aluno_id: number | null;
  aluno_nome: string | null;
  tipo: string;
  descricao: string | null;
  valor: number;
  vencimento: string | null;
  pago_em: string | null;
  status: string;
};

export async function getLancamentos(): Promise<Lancamento[]> {
  const result = await pool.query(`
    SELECT
      l.*,
      a.nome AS aluno_nome
    FROM lancamentos l
    LEFT JOIN alunos a ON a.id = l.aluno_id
    ORDER BY l.vencimento
  `);
  return result.rows.map((row) => ({
    ...row,
    valor: Number(row.valor),
    vencimento: row.vencimento ? row.vencimento.toISOString().split("T")[0] : null,
    pago_em: row.pago_em ? row.pago_em.toISOString().split("T")[0] : null,
  }));
}

export async function getLancamento(id: number): Promise<Lancamento | null> {
  const result = await pool.query(
    `SELECT l.*, a.nome AS aluno_nome
     FROM lancamentos l
     LEFT JOIN alunos a ON a.id = l.aluno_id
     WHERE l.id = $1`,
    [id]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    ...row,
    valor: Number(row.valor),
    vencimento: row.vencimento ? row.vencimento.toISOString().split("T")[0] : null,
    pago_em: row.pago_em ? row.pago_em.toISOString().split("T")[0] : null,
  };
}
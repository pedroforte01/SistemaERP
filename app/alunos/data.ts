import pool from "@/lib/db";

export type Aluno = {
  id: number;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  status: "ativo" | "inadimplente" | "inativo";
  saldo_pendente: number;
};

export async function getAlunos(): Promise<Aluno[]> {
  const result = await pool.query(`
    SELECT
      a.*,
      COALESCE(
        SUM(CASE WHEN l.tipo = 'receber' AND l.status = 'pendente' THEN l.valor ELSE 0 END),
        0
      ) AS saldo_pendente
    FROM alunos a
    LEFT JOIN lancamentos l ON l.aluno_id = a.id
    GROUP BY a.id
    ORDER BY a.id
  `);
  return result.rows.map((row) => ({
    ...row,
    saldo_pendente: Number(row.saldo_pendente),
  }));
}

export async function getAlunoById(id: string): Promise<Aluno | null> {
  const result = await pool.query("SELECT * FROM alunos WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}
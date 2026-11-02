import pool from "@/lib/db";
import { formatarData } from "@/lib/periodo";

export type Aluno = {
  id: number;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  status: "ativo" | "inadimplente" | "inativo";
  data_matricula: string;
  saldo_pendente: number;
};

// O banco devolve a data como objeto Date; a tela precisa do texto "2026-10-15".
function dataTexto(valor: Date | string | null): string {
  if (!valor) return "";
  return valor instanceof Date ? formatarData(valor) : String(valor).slice(0, 10);
}

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
    data_matricula: dataTexto(row.data_matricula),
    saldo_pendente: Number(row.saldo_pendente),
  }));
}

export async function getAlunoById(id: string): Promise<Aluno | null> {
  const result = await pool.query("SELECT * FROM alunos WHERE id = $1", [id]);
  const row = result.rows[0];
  if (!row) return null;
  return { ...row, data_matricula: dataTexto(row.data_matricula) };
}
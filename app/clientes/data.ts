import pool from "@/lib/db";

export type Cliente = {
  id: number;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  status: "ativo" | "inadimplente" | "inativo";
  saldo_pendente: number;
};

export async function getClientes(): Promise<Cliente[]> {
  const result = await pool.query(`
    SELECT
      c.*,
      COALESCE(
        SUM(CASE WHEN l.tipo = 'receber' AND l.status = 'pendente' THEN l.valor ELSE 0 END),
        0
      ) AS saldo_pendente
    FROM clientes c
    LEFT JOIN lancamentos l ON l.cliente_id = c.id
    GROUP BY c.id
    ORDER BY c.id
  `);

  return result.rows.map((row) => ({
    ...row,
    saldo_pendente: Number(row.saldo_pendente),
  }));
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const result = await pool.query("SELECT * FROM clientes WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}
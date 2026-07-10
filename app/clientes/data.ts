import pool from "@/lib/db";

export type Cliente = {
  id: number;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  ativo: boolean;
};

export async function getClientes(): Promise<Cliente[]> {
  const result = await pool.query("SELECT * FROM clientes ORDER BY id");
  return result.rows;
}
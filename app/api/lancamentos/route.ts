import pool from "@/lib/db";
import { formatarData } from "@/lib/periodo";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await pool.query(
    "SELECT * FROM lancamentos ORDER BY vencimento"
  );
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  try {
    const { aluno_id, tipo, valor, vencimento, status, descricao, pago_em } =
      await request.json();

    const statusFinal = status ?? "pendente";
    const dataPagamento =
      statusFinal === "pago" ? (pago_em || formatarData(new Date())) : null;

    const result = await pool.query(
      `INSERT INTO lancamentos
         (aluno_id, tipo, valor, vencimento, status, descricao, pago_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        aluno_id || null,
        tipo,
        valor,
        vencimento || null,
        statusFinal,
        descricao?.trim() || null,
        dataPagamento,
      ]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar lançamento:", error);
    return NextResponse.json(
      { erro: "Não foi possível salvar o lançamento" },
      { status: 500 }
    );
  }
}
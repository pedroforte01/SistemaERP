import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { aluno_id, tipo, valor, vencimento, status, pago_em, descricao } = body;
    const temDescricao = "descricao" in body;

    const result = await pool.query(
      `UPDATE lancamentos
       SET aluno_id = $1, tipo = $2, valor = $3, vencimento = $4,
           status = $5, pago_em = $6,
           descricao = CASE WHEN $7::boolean THEN $8::varchar ELSE descricao END
       WHERE id = $9
       RETURNING *`,
      [
        aluno_id || null,
        tipo,
        valor,
        vencimento || null,
        status,
        pago_em || null,
        temDescricao,
        descricao?.trim() || null,
        id,
      ]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ erro: "Lançamento não encontrado" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar lançamento:", error);
    return NextResponse.json(
      { erro: "Não foi possível atualizar o lançamento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await pool.query("DELETE FROM lancamentos WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
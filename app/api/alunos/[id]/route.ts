import pool from "@/lib/db";
import { NextResponse } from "next/server";

const DATA = /^\d{4}-\d{2}-\d{2}$/;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nome, documento, email, telefone, status, data_matricula } =
      await request.json();
    const matricula = DATA.test(data_matricula ?? "") ? data_matricula : null;

    const result = await pool.query(
      `UPDATE alunos
       SET nome = $1, documento = $2, email = $3, telefone = $4, status = $5,
           data_matricula = COALESCE($6::date, data_matricula)
       WHERE id = $7
       RETURNING *`,
      [nome, documento, email, telefone, status, matricula, id]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ erro: "Aluno não encontrado" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    return NextResponse.json(
      { erro: "Não foi possível atualizar o aluno" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await pool.query("DELETE FROM alunos WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { cobranca_mensal } = await request.json();

    if (typeof cobranca_mensal !== "boolean") {
      return NextResponse.json({ erro: "Valor inválido" }, { status: 400 });
    }

    const result = await pool.query(
      "UPDATE alunos SET cobranca_mensal = $1 WHERE id = $2 RETURNING id, cobranca_mensal",
      [cobranca_mensal, id]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ erro: "Aluno não encontrado" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao alterar cobrança mensal:", error);
    return NextResponse.json(
      { erro: "Não foi possível alterar a cobrança mensal" },
      { status: 500 }
    );
  }
}
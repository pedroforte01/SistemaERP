import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { nome, documento, email, telefone, status } = await request.json();
  const result = await pool.query(
    "UPDATE alunos SET nome = $1, documento = $2, email = $3, telefone = $4, status = $5 WHERE id = $6 RETURNING *",
    [nome, documento, email, telefone, status, id]
  );
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await pool.query("DELETE FROM alunos WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
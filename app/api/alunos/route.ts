import pool from "@/lib/db";
import { NextResponse } from "next/server";

const DATA = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const result = await pool.query("SELECT * FROM alunos ORDER BY nome");
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  try {
    const { nome, documento, email, telefone, status, data_matricula } =
      await request.json();
    const matricula = DATA.test(data_matricula ?? "") ? data_matricula : null;

    const result = await pool.query(
      `INSERT INTO alunos (nome, documento, email, telefone, status, data_matricula)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE))
       RETURNING *`,
      [nome, documento, email, telefone, status ?? "ativo", matricula]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);
    return NextResponse.json(
      { erro: "Não foi possível cadastrar o aluno" },
      { status: 500 }
    );
  }
}
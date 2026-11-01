import pool from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await pool.query("SELECT * FROM alunos ORDER BY nome");
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const { nome, documento, email, telefone, status } = await request.json();

  const result = await pool.query(
    "INSERT INTO alunos (nome, documento, email, telefone, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [nome, documento, email, telefone, status ?? "ativo"]
  );

  return NextResponse.json(result.rows[0]);
}
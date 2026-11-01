import pool from "@/lib/db";
import { NextResponse } from "next/server";

const TIPOS = ["receber", "pagar"];

export async function GET(request: Request) {
  const tipo = new URL(request.url).searchParams.get("tipo");

  const result = tipo
    ? await pool.query(
        "SELECT id, nome, tipo FROM descricoes_salvas WHERE tipo = $1 ORDER BY nome",
        [tipo]
      )
    : await pool.query(
        "SELECT id, nome, tipo FROM descricoes_salvas ORDER BY tipo, nome"
      );

  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const { nome, tipo } = await request.json();
  const nomeLimpo = String(nome ?? "").trim();

  if (!nomeLimpo || nomeLimpo.length > 100 || !TIPOS.includes(tipo)) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO descricoes_salvas (nome, tipo)
     VALUES ($1, $2)
     ON CONFLICT (nome, tipo) DO NOTHING
     RETURNING *`,
    [nomeLimpo, tipo]
  );

  return NextResponse.json(result.rows[0] ?? { nome: nomeLimpo, tipo, jaExistia: true });
}
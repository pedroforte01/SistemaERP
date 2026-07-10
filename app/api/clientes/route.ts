import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { nome, documento, email, telefone } = await request.json();

  await pool.query(
    "INSERT INTO clientes (nome, documento, email, telefone) VALUES ($1, $2, $3, $4)",
    [nome, documento, email, telefone]
  );

  return NextResponse.json({ ok: true });
}
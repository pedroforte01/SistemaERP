import { NextResponse } from "next/server";
import { CATALOGO, type DadoId } from "@/lib/graficos-catalogo";
import { buscarDados } from "@/lib/graficos";
import { lerPeriodo } from "@/lib/periodo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dado = searchParams.get("dado") ?? "";

  if (!Object.keys(CATALOGO).includes(dado)) {
    return NextResponse.json({ erro: "Dado desconhecido" }, { status: 400 });
  }

  const periodo = lerPeriodo({
    de: searchParams.get("de") ?? undefined,
    ate: searchParams.get("ate") ?? undefined,
  });

  try {
    const dados = await buscarDados(dado as DadoId, periodo);
    return NextResponse.json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados do gráfico:", error);
    return NextResponse.json(
      { erro: "Não foi possível carregar o gráfico" },
      { status: 500 }
    );
  }
}
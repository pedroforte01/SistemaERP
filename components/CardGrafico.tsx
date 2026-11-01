"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CATALOGO,
  NOMES_VISUAL,
  type DadoId,
  type DadosGrafico,
  type Forma,
  type Ponto,
  type VisualId,
} from "@/lib/graficos-catalogo";

const brl = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const compacto = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const PALETA = ["#0d9488", "#2563eb", "#d97706", "#7c3aed", "#db2777", "#65a30d"];

const campo = "rounded-md border border-border bg-card px-2 py-1 text-sm";

type Resultado = { chave: string; dados: DadosGrafico | null };

function corDoPonto(ponto: Ponto, indice: number): string {
  return typeof ponto.cor === "string" ? ponto.cor : PALETA[indice % PALETA.length];
}

function Grafico({
  dados,
  visual,
  moeda,
  forma,
}: {
  dados: DadosGrafico;
  visual: VisualId;
  moeda: boolean;
  forma: Forma;
}) {
  const formatar = (v: number) => (moeda ? brl(v) : String(v));
  const eixoY = (v: number) =>
    moeda ? `R$ ${compacto.format(v)}` : compacto.format(v);
  const serie = dados.series[0];

  if (visual === "pizza") {
    const total = dados.pontos.reduce((soma, p) => soma + Number(p[serie.chave]), 0);

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dados.pontos}
            dataKey={serie.chave}
            nameKey="rotulo"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
          >
            {dados.pontos.map((p, i) => (
              <Cell key={p.rotulo} fill={corDoPonto(p, i)} />
            ))}
          </Pie>
          <Tooltip formatter={(valor) => formatar(Number(valor))} />
          <Legend
            formatter={(nome) => {
              const ponto = dados.pontos.find((p) => p.rotulo === nome);
              const valor = ponto ? Number(ponto[serie.chave]) : 0;
              const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
              return `${nome} · ${formatar(valor)} (${pct}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (visual === "linha") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados.pontos}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
          <XAxis dataKey="rotulo" tickLine={false} axisLine={false} fontSize={12} minTickGap={16} />
          <YAxis tickFormatter={eixoY} allowDecimals={moeda} tickLine={false} axisLine={false} fontSize={12} width={72} />
          <Tooltip formatter={(valor) => formatar(Number(valor))} />
          <Legend />
          {dados.series.map((s) => (
            <Line
              key={s.chave}
              type="monotone"
              dataKey={s.chave}
              name={s.nome}
              stroke={s.cor}
              strokeWidth={2}
              dot={dados.pontos.length <= 12}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dados.pontos}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
        <XAxis dataKey="rotulo" tickLine={false} axisLine={false} fontSize={12} minTickGap={16} />
        <YAxis tickFormatter={eixoY} allowDecimals={moeda} tickLine={false} axisLine={false} fontSize={12} width={72} />
        <Tooltip formatter={(valor) => formatar(Number(valor))} cursor={{ fill: "#f4f4f5" }} />
        {forma === "tempo" && <Legend />}
        {forma === "tempo" ? (
          dados.series.map((s) => (
            <Bar
              key={s.chave}
              dataKey={s.chave}
              name={s.nome}
              fill={s.cor}
              radius={[4, 4, 0, 0]}
            />
          ))
        ) : (
          <Bar dataKey={serie.chave} name={serie.nome} radius={[4, 4, 0, 0]}>
            {dados.pontos.map((p, i) => (
              <Cell key={p.rotulo} fill={corDoPonto(p, i)} />
            ))}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function CardGrafico({ de, ate }: { de: string; ate: string }) {
  const idsDados = Object.keys(CATALOGO) as DadoId[];
  const [dado, setDado] = useState<DadoId>(idsDados[0]);
  const [visual, setVisual] = useState<VisualId>(CATALOGO[idsDados[0]].visuais[0]);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const config = CATALOGO[dado];
  const chave = `${dado}|${de}|${ate}`;

  useEffect(() => {
    let cancelado = false;

    fetch(`/api/graficos?dado=${dado}&de=${de}&ate=${ate}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json: DadosGrafico) => {
        if (!cancelado) setResultado({ chave, dados: json });
      })
      .catch(() => {
        if (!cancelado) setResultado({ chave, dados: null });
      });

    return () => {
      cancelado = true;
    };
  }, [chave, dado, de, ate]);

  function trocarDado(novo: DadoId) {
    setDado(novo);
    if (!CATALOGO[novo].visuais.includes(visual)) {
      setVisual(CATALOGO[novo].visuais[0]);
    }
  }

  const carregando = resultado?.chave !== chave;
  const dados = !carregando ? resultado?.dados ?? null : null;
  const semDados =
    dados !== null &&
    dados.pontos.every((p) => dados.series.every((s) => Number(p[s.chave]) === 0));

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
            <h3 className="text-base font-semibold text-foreground">Análise de dados</h3>
            <p className="text-xs text-muted">{config.nota}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={dado}
            onChange={(e) => trocarDado(e.target.value as DadoId)}
            className={campo}
          >
            {idsDados.map((id) => (
              <option key={id} value={id}>
                {CATALOGO[id].nome}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            {config.visuais.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisual(v)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  visual === v
                    ? "border-accent bg-accent text-white"
                    : "border-border text-foreground/70 hover:border-accent hover:text-accent"
                }`}
              >
                {NOMES_VISUAL[v]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        {carregando ? (
          <p className="flex h-full items-center justify-center text-sm text-muted">
            Carregando...
          </p>
        ) : !dados ? (
          <p className="flex h-full items-center justify-center text-sm text-danger">
            Não foi possível carregar o gráfico.
          </p>
        ) : semDados ? (
          <p className="flex h-full items-center justify-center text-sm text-muted">
            Sem dados para exibir.
          </p>
        ) : (
          <Grafico
            dados={dados}
            visual={visual}
            moeda={config.moeda}
            forma={config.forma}
          />
        )}
      </div>
    </div>
  );
}
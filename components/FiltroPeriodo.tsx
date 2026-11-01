"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatarData, periodoDoMes, type Periodo } from "@/lib/periodo";

const campo = "rounded-md border border-border bg-card px-2 py-1 text-sm";
const rotulo = "mb-1 block text-xs text-muted";

export default function FiltroPeriodo({ de, ate }: Periodo) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [deLivre, setDeLivre] = useState(de);
  const [ateLivre, setAteLivre] = useState(ate);

  const hoje = new Date();
  const atalhos: { rotulo: string; periodo: Periodo }[] = [
    { rotulo: "Este mês", periodo: periodoDoMes(hoje) },
    {
      rotulo: "Mês passado",
      periodo: periodoDoMes(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)),
    },
    {
      rotulo: "Últimos 30 dias",
      periodo: {
        de: formatarData(
          new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 29)
        ),
        ate: formatarData(hoje),
      },
    },
    {
      rotulo: "Este ano",
      periodo: { de: `${hoje.getFullYear()}-01-01`, ate: `${hoje.getFullYear()}-12-31` },
    },
  ];

  const mesDoPeriodo = periodoDoMes(
    new Date(Number(de.slice(0, 4)), Number(de.slice(5, 7)) - 1, 1)
  );
  const ehMesCheio = mesDoPeriodo.de === de && mesDoPeriodo.ate === ate;

  function aplicar(p: Periodo) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("de", p.de);
    params.set("ate", p.ate);
    router.push(`${pathname}?${params.toString()}`);
  }

  const intervaloInvalido = !deLivre || !ateLivre || deLivre > ateLivre;

  return (
    <div className="flex flex-col gap-3 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {atalhos.map((a) => {
          const ativo = a.periodo.de === de && a.periodo.ate === ate;
          return (
            <button
              key={a.rotulo}
              type="button"
              onClick={() => aplicar(a.periodo)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                ativo
                  ? "border-accent bg-accent text-white"
                  : "border-border text-foreground/70 hover:border-accent hover:text-accent"
              }`}
            >
              {a.rotulo}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className={rotulo}>Mês</label>
          <input
            type="month"
            value={ehMesCheio ? de.slice(0, 7) : ""}
            onChange={(e) => {
              if (!e.target.value) return;
              const [ano, mes] = e.target.value.split("-").map(Number);
              aplicar(periodoDoMes(new Date(ano, mes - 1, 1)));
            }}
            className={campo}
          />
        </div>
        <div>
          <label className={rotulo}>De</label>
          <input
            type="date"
            value={deLivre}
            onChange={(e) => setDeLivre(e.target.value)}
            className={campo}
          />
        </div>
        <div>
          <label className={rotulo}>Até</label>
          <input
            type="date"
            value={ateLivre}
            onChange={(e) => setAteLivre(e.target.value)}
            className={campo}
          />
        </div>
        <button
          type="button"
          disabled={intervaloInvalido}
          onClick={() => aplicar({ de: deLivre, ate: ateLivre })}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
import type { LucideIcon } from "lucide-react";

type Tom = "neutro" | "accent" | "info" | "success" | "warning" | "danger";

const tons: Record<Tom, { texto: string; fundo: string }> = {
  neutro: { texto: "text-foreground", fundo: "bg-border/50" },
  accent: { texto: "text-accent", fundo: "bg-accent-soft" },
  info: { texto: "text-info", fundo: "bg-info-soft" },
  success: { texto: "text-success", fundo: "bg-success/10" },
  warning: { texto: "text-warning", fundo: "bg-warning-soft" },
  danger: { texto: "text-danger", fundo: "bg-danger-soft" },
};

type Props = {
  rotulo: string;
  valor: string | number;
  icone: LucideIcon;
  tom?: Tom;
  detalhe?: string;
};

export default function CardMetrica({
  rotulo,
  valor,
  icone: Icone,
  tom = "neutro",
  detalhe,
}: Props) {
  const t = tons[tom];

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted">{rotulo}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.fundo} ${t.texto}`}
        >
          <Icone size={18} />
        </div>
      </div>
      <p className={`mt-4 text-3xl font-semibold tracking-tight ${t.texto}`}>
        {valor}
      </p>
      {detalhe && <p className="mt-1 text-xs text-muted">{detalhe}</p>}
    </div>
  );
}

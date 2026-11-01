"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet } from "lucide-react";

const itens = [
  { href: "/dashboard", label: "Dashboard", icone: LayoutDashboard },
  { href: "/alunos", label: "Alunos", icone: Users },
  { href: "/lancamentos", label: "Finanças", icone: Wallet },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <Link
        href="/"
        className="flex items-center gap-3 border-b border-white/10 px-5 py-5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-bold text-white">
          S
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Sistema ERP</p>
          <p className="text-xs text-sidebar-foreground/70">Gestão da academia</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 p-3">
        {itens.map(({ href, label, icone: Icone }) => {
          const ativo = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                ativo
                  ? "bg-sidebar-active text-white"
                  : "hover:bg-sidebar-active/60"
              }`}
            >
              <Icone size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
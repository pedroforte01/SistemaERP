export type Periodo = {
  de: string; // "2026-10-01"
  ate: string; // "2026-10-31"
};

export function formatarData(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function dataBR(texto: string): string {
  const [ano, mes, dia] = texto.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function periodoDoMes(referencia: Date = new Date()): Periodo {
  const primeiro = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
  const ultimo = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0);
  return { de: formatarData(primeiro), ate: formatarData(ultimo) };
}

function dataValida(texto?: string): texto is string {
  if (!texto || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [ano, mes, dia] = texto.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  return (
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia
  );
}

// Lê ?de=...&ate=... da URL. Se vier errado ou vazio, usa o mês atual.
export function lerPeriodo(params: { de?: string; ate?: string }): Periodo {
  if (dataValida(params.de) && dataValida(params.ate) && params.de <= params.ate) {
    return { de: params.de, ate: params.ate };
  }
  return periodoDoMes();
}

// Período de comparação: se for um mês cheio, o mês anterior;
// senão, o mesmo número de dias logo antes.
export function periodoAnterior(p: Periodo): Periodo {
  const [a1, m1, d1] = p.de.split("-").map(Number);
  const [a2, m2, d2] = p.ate.split("-").map(Number);
  const inicio = new Date(a1, m1 - 1, d1);
  const fim = new Date(a2, m2 - 1, d2);

  const mesCheio = periodoDoMes(inicio);
  if (p.de === mesCheio.de && p.ate === mesCheio.ate) {
    return periodoDoMes(new Date(a1, m1 - 2, 1));
  }

  const dias = Math.round((fim.getTime() - inicio.getTime()) / 86400000) + 1;
  const novoFim = new Date(a1, m1 - 1, d1 - 1);
  const novoInicio = new Date(
    novoFim.getFullYear(),
    novoFim.getMonth(),
    novoFim.getDate() - (dias - 1)
  );
  return { de: formatarData(novoInicio), ate: formatarData(novoFim) };
}
import pool from "./db";

const MAX_MESES = 24; // teto de segurança contra uma data de início errada
let ultimaExecucao = 0;
let emAndamento: Promise<number> | null = null;

type Regra = {
  id: number;
  tipo: string;
  descricao: string | null;
  valor: string;
  dia_vencimento: number;
  alvo: "todos" | "aluno" | "nenhum";
  aluno_id: number | null;
  inicio: Date;
  gerado_ate: string | null;
};

const dois = (n: number) => String(n).padStart(2, "0");
const referencia = (ano: number, mes0: number) => `${ano}-${dois(mes0 + 1)}`;

// Cria as cobranças de UM mês para UMA regra. Devolve quantas foram criadas.
async function gerarMes(regra: Regra, ano: number, mes0: number): Promise<number> {
  const ultimoDia = new Date(ano, mes0 + 1, 0).getDate();
  const ref = referencia(ano, mes0);
  const vencimento = `${ref}-${dois(Math.min(regra.dia_vencimento, ultimoDia))}`;
  const fimDoMes = `${ref}-${dois(ultimoDia)}`;

  if (regra.alvo === "nenhum") {
    const r = await pool.query(
      `INSERT INTO lancamentos
         (aluno_id, tipo, valor, vencimento, status, descricao, recorrencia_id, referencia)
       SELECT NULL::int, $1::varchar, $2::numeric, $3::date, 'pendente',
              $4::varchar, $5::int, $6::varchar
       WHERE NOT EXISTS (
         SELECT 1 FROM lancamentos x
         WHERE x.aluno_id IS NULL
           AND x.tipo = $1::varchar
           AND x.descricao IS NOT DISTINCT FROM $4::varchar
           AND to_char(x.vencimento, 'YYYY-MM') = $6::varchar
       )
       ON CONFLICT DO NOTHING`,
      [regra.tipo, regra.valor, vencimento, regra.descricao, regra.id, ref]
    );
    return r.rowCount ?? 0;
  }

  const r = await pool.query(
    `INSERT INTO lancamentos
       (aluno_id, tipo, valor, vencimento, status, descricao, recorrencia_id, referencia)
     SELECT a.id, $1::varchar, $2::numeric, $3::date, 'pendente',
            $4::varchar, $5::int, $6::varchar
     FROM alunos a
     WHERE a.status IN ('ativo', 'inadimplente')
       AND a.data_matricula <= $7::date
       AND ($8::int IS NULL OR a.id = $8::int)
       AND ($8::int IS NOT NULL OR a.cobranca_mensal = true)
       AND NOT EXISTS (
         SELECT 1 FROM lancamentos x
         WHERE x.aluno_id = a.id
           AND x.tipo = $1::varchar
           AND x.descricao IS NOT DISTINCT FROM $4::varchar
           AND to_char(x.vencimento, 'YYYY-MM') = $6::varchar
       )
     ON CONFLICT DO NOTHING`,
    [
      regra.tipo,
      regra.valor,
      vencimento,
      regra.descricao,
      regra.id,
      ref,
      fimDoMes,
      regra.alvo === "aluno" ? regra.aluno_id : null,
    ]
  );
  return r.rowCount ?? 0;
}

async function executar(): Promise<number> {
  let criados = 0;

  try {
    const { rows } = await pool.query<Regra>(
      `SELECT id, tipo, descricao, valor, dia_vencimento, alvo, aluno_id, inicio, gerado_ate
       FROM recorrencias
       WHERE ativa = true
       ORDER BY id`
    );

    const hoje = new Date();
    const limite = referencia(hoje.getFullYear(), hoje.getMonth());
    const maisAntigo = new Date(hoje.getFullYear(), hoje.getMonth() - (MAX_MESES - 1), 1);
    const piso = referencia(maisAntigo.getFullYear(), maisAntigo.getMonth());

    for (const regra of rows) {
      const inicioRef = referencia(regra.inicio.getFullYear(), regra.inicio.getMonth());
      let desde =
        regra.gerado_ate && regra.gerado_ate > inicioRef ? regra.gerado_ate : inicioRef;
      if (desde < piso) desde = piso;
      if (desde > limite) continue; // regra que só começa em mês futuro

      let ano = Number(desde.slice(0, 4));
      let mes0 = Number(desde.slice(5, 7)) - 1;

      while (referencia(ano, mes0) <= limite) {
        criados += await gerarMes(regra, ano, mes0);
        mes0++;
        if (mes0 > 11) {
          mes0 = 0;
          ano++;
        }
      }

      await pool.query("UPDATE recorrencias SET gerado_ate = $1 WHERE id = $2", [
        limite,
        regra.id,
      ]);
    }
  } catch (error) {
    console.error("Erro ao gerar recorrências:", error);
  }

  return criados;
}

// Chamada ao abrir o sistema. Pode rodar quantas vezes quiser: não duplica nada.
// "forcar" ignora a pausa de 60 segundos (usado ao criar uma regra nova).
export function gerarRecorrencias(forcar = false): Promise<number> {
  if (emAndamento) {
    return forcar
      ? emAndamento.then(() => gerarRecorrencias(true))
      : emAndamento;
  }
  if (!forcar && Date.now() - ultimaExecucao < 60_000) return Promise.resolve(0);

  ultimaExecucao = Date.now();
  emAndamento = executar().finally(() => {
    emAndamento = null;
  });
  return emAndamento;
}
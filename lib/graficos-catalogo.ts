export type VisualId = "colunas" | "linha" | "pizza";

export type DadoId =
  | "receita_despesa"
  | "receita_descricao"
  | "despesa_descricao"
  | "alunos_status";

export type Forma = "tempo" | "categorias";

export type Ponto = { rotulo: string } & Record<string, string | number>;

export type DadosGrafico = {
  series: { chave: string; nome: string; cor: string }[];
  pontos: Ponto[];
};

export const NOMES_VISUAL: Record<VisualId, string> = {
  colunas: "Colunas",
  linha: "Linha",
  pizza: "Pizza",
};

export const CATALOGO: Record<
  DadoId,
  { nome: string; nota: string; visuais: VisualId[]; moeda: boolean; forma: Forma }
> = {
  receita_despesa: {
    nome: "Receita × Despesa",
    nota: "Só lançamentos pagos, pela data do pagamento",
    visuais: ["colunas", "linha"],
    moeda: true,
    forma: "tempo",
  },
  receita_descricao: {
    nome: "Receita por descrição",
    nota: "Só receitas pagas no período, agrupadas pela descrição",
    visuais: ["pizza", "colunas"],
    moeda: true,
    forma: "categorias",
  },
  despesa_descricao: {
    nome: "Despesa por descrição",
    nota: "Só despesas pagas no período, agrupadas pela descrição",
    visuais: ["pizza", "colunas"],
    moeda: true,
    forma: "categorias",
  },
  alunos_status: {
    nome: "Alunos por status (hoje)",
    nota: "Situação de hoje, não segue o período",
    visuais: ["pizza", "colunas"],
    moeda: false,
    forma: "categorias",
  },
};
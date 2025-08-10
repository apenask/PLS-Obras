export type ID = string;

export type Obra = {
  id: ID;
  nome: string;
  cidade?: string;
  ativo: boolean;
  criadoEm: string;
};

export type Produto = {
  id: ID;
  nome: string;
  categoria?: string;
  unidade: string;
  sku?: string;
  preco?: number;
  estoque?: number;
  ativo: boolean;
};

export type Fornecedor = {
  id: ID;
  nome: string;
  cnpjCpf?: string;
  contato?: string;
  ativo: boolean;
};

export type TalaoStatus = 'A separar' | 'Em entrega' | 'Concluído' | 'Devolvido Parcial' | 'Devolvido Total';
export type OrigemItem = 'estoque' | 'compra_externa';

export type ItemTal = {
  id: ID;
  produtoId?: ID;
  descricaoLivre?: string;
  qtd: number;
  unidade: string;
  origem: OrigemItem;
  precoUnit?: number;
  qtdEntregue?: number;
  qtdDevolvida?: number;
  vinculosCompra?: { itemCompraId: ID; qtdVinculada: number }[];
};

export type Talao = {
  id: ID;
  numero: string;
  obraId: ID;
  solicitante: string;
  status: TalaoStatus;
  itens: ItemTal[];
  assinatura?: {
    nomeRecebedor: string;
    cpf?: string;
    dataHora: string;
    imageDataUrl?: string;
  };
  criadoEm: string;
};

export type CompraExterna = {
  id: ID;
  fornecedorId: ID;
  numeroNota?: string;
  data: string;
  anexos?: { nome: string; mime: string; dataUrl: string }[];
  itens: ItemCompra[];
};

export type ItemCompra = {
  id: ID;
  produtoId?: ID;
  descricaoLivre: string;
  qtd: number;
  unidade: string;
  custoUnit: number;
  markupAplicado: number;
  precoUnitObra: number;
};

export type RegraMarkup = {
  id: ID;
  alvo: 'global' | 'categoria' | 'obra';
  ref?: string;
  percentual: number;
};

export type Devolucao = {
  id: ID;
  talaoId: ID;
  itemTalId: ID;
  qtd: number;
  motivo?: string;
  data: string;
};

export type AjusteEstoque = {
  id: ID;
  produtoId: ID;
  delta: number;
  motivo: string;
  data: string;
};

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'compras' | 'almoxarife' | 'obra' | 'financeiro';
  ativo: boolean;
};

export type Config = {
  markupGlobal: number;
  tema: 'light' | 'dark';
  supabase?: {
    url: string;
    anonKey: string;
    enabled: boolean;
    lastSync?: string;
  };
};
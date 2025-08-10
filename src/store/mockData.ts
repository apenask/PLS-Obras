import { Obra, Produto, Fornecedor, Talao, CompraExterna, Usuario, MarkupRule } from '@/types'
import { generateId } from '@/lib/utils'

// Mock data for development
export const mockObras: Obra[] = [
  {
    id: '1',
    nome: 'Obra Residencial Centro',
    cidade: 'SÃ£o Paulo',
    ativo: true,
    criadoEm: '2024-01-15'
  },
  {
    id: '2',
    nome: 'Obra Comercial Norte',
    cidade: 'Rio de Janeiro',
    ativo: true,
    criadoEm: '2024-02-01'
  },
  {
    id: '3',
    nome: 'Obra Industrial Sul',
    cidade: 'Curitiba',
    ativo: false,
    criadoEm: '2024-01-10'
  }
]

export const mockProdutos: Produto[] = [
  {
    id: '1',
    nome: 'Cimento CP II-E-32',
    categoria: 'Materiais BÃ¡sicos',
    unidade: 'SC',
    sku: 'CIM001',
    ativo: true
  },
  {
    id: '2',
    nome: 'Areia MÃ©dia',
    categoria: 'Materiais BÃ¡sicos',
    unidade: 'MÂ³',
    sku: 'ARE001',
    ativo: true
  },
  {
    id: '3',
    nome: 'Brita 1',
    categoria: 'Materiais BÃ¡sicos',
    unidade: 'MÂ³',
    sku: 'BRI001',
    ativo: true
  },
  {
    id: '4',
    nome: 'Tijolo 6 furos',
    categoria: 'Alvenaria',
    unidade: 'UN',
    sku: 'TIJ001',
    ativo: true
  },
  {
    id: '5',
    nome: 'VergalhÃ£o CA-50 8mm',
    categoria: 'Estrutura',
    unidade: 'KG',
    sku: 'VER001',
    ativo: true
  }
]

export const mockFornecedores: Fornecedor[] = [
  {
    id: '1',
    nome: 'Construtora ABC Ltda',
    cnpj_cpf: '12.345.678/0001-90',
    contato: '(11) 98765-4321',
    email: 'contato@abc.com.br'
  },
  {
    id: '2',
    nome: 'Materiais XYZ',
    cnpj_cpf: '98.765.432/0001-10',
    contato: '(21) 91234-5678',
    email: 'vendas@xyz.com.br'
  },
  {
    id: '3',
    nome: 'Distribuidora Central',
    cnpj_cpf: '11.222.333/0001-44',
    contato: '(11) 95555-1234',
    email: 'pedidos@central.com.br'
  }
]

export const mockTaloes: Talao[] = [
  {
    id: '1',
    numero: 'TAL-001234',
    obraId: '1',
    solicitante: 'JoÃ£o Silva',
    status: 'A separar',
    itens: [
      {
        id: '1',
        produtoId: '1',
        descricao: 'Cimento CP II-E-32',
        qtd: 10,
        unidade: 'SC',
        origem: 'estoque',
        precoUnit: 25.50,
        total: 255.00
      },
      {
        id: '2',
        produtoId: '2',
        descricao: 'Areia MÃ©dia',
        qtd: 2,
        unidade: 'MÂ³',
        origem: 'compra_externa',
        precoUnit: 45.00,
        total: 90.00
      }
    ],
    criadoEm: '2024-08-10',
    observacoes: 'Entrega urgente'
  },
  {
    id: '2',
    numero: 'TAL-001235',
    obraId: '2',
    solicitante: 'Maria Santos',
    status: 'Em entrega',
    itens: [
      {
        id: '3',
        produtoId: '4',
        descricao: 'Tijolo 6 furos',
        qtd: 1000,
        unidade: 'UN',
        origem: 'estoque',
        precoUnit: 0.85,
        total: 850.00
      }
    ],
    criadoEm: '2024-08-09'
  }
]

export const mockComprasExternas: CompraExterna[] = [
  {
    id: '1',
    fornecedorId: '1',
    data: '2024-08-08',
    numeroNota: 'NF-12345',
    itens: [
      {
        id: '1',
        descricao: 'Areia MÃ©dia Lavada',
        qtd: 5,
        unidade: 'MÂ³',
        custoUnit: 35.00,
        markup: 0.20,
        precoUnitObra: 42.00,
        total: 210.00
      },
      {
        id: '2',
        descricao: 'Brita 1 Limpa',
        qtd: 3,
        unidade: 'MÂ³',
        custoUnit: 40.00,
        markup: 0.20,
        precoUnitObra: 48.00,
        total: 144.00
      }
    ],
    totalCusto: 295.00,
    totalReceita: 354.00,
    observacoes: 'Material de qualidade superior'
  }
]

export const mockUsuarios: Usuario[] = [
  {
    id: '1',
    nome: 'Administrador',
    email: 'admin@pls.com',
    role: 'admin',
    ativo: true
  },
  {
    id: '2',
    nome: 'JoÃ£o Compras',
    email: 'compras@pls.com',
    role: 'compras',
    ativo: true
  },
  {
    id: '3',
    nome: 'Maria Almoxarife',
    email: 'almoxarife@pls.com',
    role: 'almoxarife',
    ativo: true
  }
]

export const mockMarkupRules: MarkupRule[] = [
  {
    id: '1',
    tipo: 'global',
    percentual: 0.20
  },
  {
    id: '2',
    tipo: 'categoria',
    referencia: 'Materiais BÃ¡sicos',
    percentual: 0.15
  },
  {
    id: '3',
    tipo: 'obra',
    referencia: '1',
    percentual: 0.25
  }
]

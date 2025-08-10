import { useStore } from '@/store/useStore';
import { generateId } from '@/lib/helpers';

export function loadSeedData() {
  const store = useStore.getState();
  
  // Verificar se já tem dados
  if (store.obras.length > 0) return;
  
  // Obras
  store.addObra({ nome: 'Obra Residencial Centro', cidade: 'São Paulo', ativo: true });
  store.addObra({ nome: 'Obra Comercial Norte', cidade: 'Rio de Janeiro', ativo: true });
  
  // Produtos
  store.addProduto({
    nome: 'Cimento CP II-E-32',
    categoria: 'Materiais Básicos',
    unidade: 'SC',
    sku: 'CIM001',
    preco: 25.50,
    estoque: 100,
    ativo: true
  });
  
  store.addProduto({
    nome: 'Areia Média',
    categoria: 'Materiais Básicos',
    unidade: 'M³',
    sku: 'ARE001',
    preco: 45.00,
    estoque: 50,
    ativo: true
  });
  
  store.addProduto({
    nome: 'Brita 1',
    categoria: 'Materiais Básicos',
    unidade: 'M³',
    sku: 'BRI001',
    preco: 48.00,
    estoque: 30,
    ativo: true
  });
  
  store.addProduto({
    nome: 'Tijolo 6 furos',
    categoria: 'Alvenaria',
    unidade: 'UN',
    sku: 'TIJ001',
    preco: 0.85,
    estoque: 5000,
    ativo: true
  });
  
  store.addProduto({
    nome: 'Vergalhão CA-50 8mm',
    categoria: 'Estrutura',
    unidade: 'KG',
    sku: 'VER001',
    preco: 6.50,
    estoque: 200,
    ativo: true
  });
  
  // Fornecedores
  store.addFornecedor({
    nome: 'Construtora ABC Ltda',
    cnpjCpf: '12.345.678/0001-90',
    contato: '(11) 98765-4321',
    ativo: true
  });
  
  store.addFornecedor({
    nome: 'Materiais XYZ',
    cnpjCpf: '98.765.432/0001-10',
    contato: '(21) 91234-5678',
    ativo: true
  });
  
  // Talão com devolução parcial
  const obras = store.obras;
  const produtos = store.produtos;
  
  if (obras.length > 0 && produtos.length > 0) {
    const talaoId = generateId();
    const itemId = generateId();
    
    store.addTalao({
      id: talaoId,
      obraId: obras[0].id,
      solicitante: 'João Silva',
      status: 'Concluído',
      itens: [{
        id: itemId,
        produtoId: produtos[0].id,
        descricaoLivre: produtos[0].nome,
        qtd: 10,
        unidade: produtos[0].unidade,
        origem: 'estoque',
        precoUnit: produtos[0].preco,
        qtdEntregue: 10,
        qtdDevolvida: 0
      }],
      assinatura: {
        nomeRecebedor: 'Maria Santos',
        cpf: '123.456.789-00',
        dataHora: new Date().toISOString()
      }
    });
    
    // Registrar devolução parcial
    setTimeout(() => {
      store.registrarDevolucao({
        talaoId,
        itemTalId: itemId,
        qtd: 3,
        motivo: 'Material com defeito'
      });
    }, 100);
  }
  
  // Compra externa
  const fornecedores = store.fornecedores;
  if (fornecedores.length > 0 && produtos.length > 0) {
    store.addCompraExterna({
      fornecedorId: fornecedores[0].id,
      numeroNota: 'NF-12345',
      data: new Date().toISOString().split('T')[0],
      itens: [{
        id: generateId(),
        produtoId: produtos[1].id,
        descricaoLivre: produtos[1].nome,
        qtd: 5,
        unidade: produtos[1].unidade,
        custoUnit: 35.00,
        markupAplicado: 0.20,
        precoUnitObra: 42.00
      }]
    });
  }
}
import { create } from 'zustand';
import localforage from 'localforage';
import { 
  Obra, Produto, Fornecedor, Talao, CompraExterna, ItemCompra, 
  RegraMarkup, Devolucao, AjusteEstoque, Usuario, Config, ID, TalaoStatus 
} from '@/types';
import { generateId, generateTalaoNumber } from '@/lib/helpers';

interface Store {
  // Data
  obras: Obra[];
  produtos: Produto[];
  fornecedores: Fornecedor[];
  taloes: Talao[];
  compras: CompraExterna[];
  devolucoes: Devolucao[];
  regrasMarkup: RegraMarkup[];
  ajustesEstoque: AjusteEstoque[];
  usuarios: Usuario[];
  config: Config;
  
  // Current user
  currentUser: Usuario | null;
  
  // Actions - Obras
  addObra: (obra: Omit<Obra, 'id' | 'criadoEm'>) => void;
  updateObra: (id: ID, obra: Partial<Obra>) => void;
  deleteObra: (id: ID) => void;
  
  // Actions - Produtos
  addProduto: (produto: Omit<Produto, 'id'>) => void;
  updateProduto: (id: ID, produto: Partial<Produto>) => void;
  deleteProduto: (id: ID) => void;
  ajusteEstoque: (produtoId: ID, delta: number, motivo: string) => void;
  
  // Actions - Fornecedores
  addFornecedor: (fornecedor: Omit<Fornecedor, 'id'>) => void;
  updateFornecedor: (id: ID, fornecedor: Partial<Fornecedor>) => void;
  deleteFornecedor: (id: ID) => void;
  
  // Actions - Talões
  addTalao: (talao: Omit<Talao, 'id' | 'numero' | 'criadoEm'>) => void;
  updateTalao: (id: ID, talao: Partial<Talao>) => void;
  deleteTalao: (id: ID) => void;
  concluirEntrega: (talaoId: ID, assinatura: Talao['assinatura']) => void;
  registrarDevolucao: (params: { talaoId: ID; itemTalId: ID; qtd: number; motivo?: string }) => void;
  
  // Actions - Compras Externas
  addCompraExterna: (compra: Omit<CompraExterna, 'id'>) => void;
  updateCompraExterna: (id: ID, compra: Partial<CompraExterna>) => void;
  deleteCompraExterna: (id: ID) => void;
  vincularCompraAoTalao: (itemCompraId: ID, itemTalId: ID, qtd: number) => void;
  
  // Actions - Markup
  aplicarMarkup: (params: { obraId?: ID; categoria?: string; custoUnit: number }) => number;
  addRegraMarkup: (regra: Omit<RegraMarkup, 'id'>) => void;
  updateRegraMarkup: (id: ID, regra: Partial<RegraMarkup>) => void;
  deleteRegraMarkup: (id: ID) => void;
  
  // Actions - Auth
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  // Actions - Config
  updateConfig: (config: Partial<Config>) => void;
  
  // Actions - Backup/Restore
  exportData: () => string;
  importData: (jsonData: string) => void;
  
  // Persistence
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const initialState = {
  obras: [],
  produtos: [],
  fornecedores: [],
  taloes: [],
  compras: [],
  devolucoes: [],
  regrasMarkup: [{ id: '1', alvo: 'global' as const, percentual: 0.2 }],
  ajustesEstoque: [],
  usuarios: [
    {
      id: '1',
      nome: 'Administrador',
      email: 'admin@pls.com',
      role: 'admin' as const,
      ativo: true
    }
  ],
  config: {
    markupGlobal: 0.2,
    tema: 'light' as const,
    supabase: {
      url: '',
      anonKey: '',
      enabled: false
    }
  },
  currentUser: null
};

export const useStore = create<Store>((set, get) => ({
  ...initialState,
  
  // Obras actions
  addObra: (obra) => {
    const newObra = {
      ...obra,
      id: generateId(),
      criadoEm: new Date().toISOString().split('T')[0]
    };
    set((state) => ({ obras: [...state.obras, newObra] }));
    get().saveToStorage();
  },
  
  updateObra: (id, obra) => {
    set((state) => ({
      obras: state.obras.map(o => o.id === id ? { ...o, ...obra } : o)
    }));
    get().saveToStorage();
  },
  
  deleteObra: (id) => {
    set((state) => ({
      obras: state.obras.filter(o => o.id !== id)
    }));
    get().saveToStorage();
  },
  
  // Produtos actions
  addProduto: (produto) => {
    const newProduto = { ...produto, id: generateId() };
    set((state) => ({ produtos: [...state.produtos, newProduto] }));
    get().saveToStorage();
  },
  
  updateProduto: (id, produto) => {
    set((state) => ({
      produtos: state.produtos.map(p => p.id === id ? { ...p, ...produto } : p)
    }));
    get().saveToStorage();
  },
  
  deleteProduto: (id) => {
    set((state) => ({
      produtos: state.produtos.filter(p => p.id !== id)
    }));
    get().saveToStorage();
  },
  
  ajusteEstoque: (produtoId, delta, motivo) => {
    const ajuste: AjusteEstoque = {
      id: generateId(),
      produtoId,
      delta,
      motivo,
      data: new Date().toISOString()
    };
    
    set((state) => ({
      produtos: state.produtos.map(p => 
        p.id === produtoId 
          ? { ...p, estoque: (p.estoque || 0) + delta }
          : p
      ),
      ajustesEstoque: [...state.ajustesEstoque, ajuste]
    }));
    get().saveToStorage();
  },
  
  // Fornecedores actions
  addFornecedor: (fornecedor) => {
    const newFornecedor = { ...fornecedor, id: generateId() };
    set((state) => ({ fornecedores: [...state.fornecedores, newFornecedor] }));
    get().saveToStorage();
  },
  
  updateFornecedor: (id, fornecedor) => {
    set((state) => ({
      fornecedores: state.fornecedores.map(f => f.id === id ? { ...f, ...fornecedor } : f)
    }));
    get().saveToStorage();
  },
  
  deleteFornecedor: (id) => {
    set((state) => ({
      fornecedores: state.fornecedores.filter(f => f.id !== id)
    }));
    get().saveToStorage();
  },
  
  // Talões actions
  addTalao: (talao) => {
    const newTalao = {
      ...talao,
      id: generateId(),
      numero: generateTalaoNumber(),
      criadoEm: new Date().toISOString().split('T')[0]
    };
    set((state) => ({ taloes: [...state.taloes, newTalao] }));
    get().saveToStorage();
  },
  
  updateTalao: (id, talao) => {
    set((state) => ({
      taloes: state.taloes.map(t => t.id === id ? { ...t, ...talao } : t)
    }));
    get().saveToStorage();
  },
  
  deleteTalao: (id) => {
    set((state) => ({
      taloes: state.taloes.filter(t => t.id !== id)
    }));
    get().saveToStorage();
  },
  
  concluirEntrega: (talaoId, assinatura) => {
    set((state) => ({
      taloes: state.taloes.map(t => 
        t.id === talaoId 
          ? { ...t, status: 'Concluído' as TalaoStatus, assinatura }
          : t
      )
    }));
    get().saveToStorage();
  },
  
  registrarDevolucao: ({ talaoId, itemTalId, qtd, motivo }) => {
    const state = get();
    const talao = state.taloes.find(t => t.id === talaoId);
    if (!talao) return;
    
    const item = talao.itens.find(i => i.id === itemTalId);
    if (!item) return;
    
    const qtdEntregue = item.qtdEntregue || 0;
    const qtdDevolvida = item.qtdDevolvida || 0;
    
    if (qtd > (qtdEntregue - qtdDevolvida)) {
      throw new Error('Quantidade de devolução maior que disponível');
    }
    
    // Registrar devolução
    const devolucao: Devolucao = {
      id: generateId(),
      talaoId,
      itemTalId,
      qtd,
      motivo,
      data: new Date().toISOString()
    };
    
    // Atualizar item
    const novoItem = {
      ...item,
      qtdDevolvida: qtdDevolvida + qtd
    };
    
    // Se origem é estoque, devolver ao estoque
    if (item.origem === 'estoque' && item.produtoId) {
      get().ajusteEstoque(item.produtoId, qtd, `Devolução do talão ${talao.numero}`);
    }
    
    // Recalcular status do talão
    const novosItens = talao.itens.map(i => i.id === itemTalId ? novoItem : i);
    let novoStatus: TalaoStatus = talao.status;
    
    const totalEntregue = novosItens.reduce((sum, i) => sum + (i.qtdEntregue || 0), 0);
    const totalDevolvido = novosItens.reduce((sum, i) => sum + (i.qtdDevolvida || 0), 0);
    
    if (totalDevolvido === totalEntregue && totalDevolvido > 0) {
      novoStatus = 'Devolvido Total';
    } else if (totalDevolvido > 0) {
      novoStatus = 'Devolvido Parcial';
    }
    
    set((state) => ({
      taloes: state.taloes.map(t => 
        t.id === talaoId 
          ? { ...t, itens: novosItens, status: novoStatus }
          : t
      ),
      devolucoes: [...state.devolucoes, devolucao]
    }));
    
    get().saveToStorage();
  },
  
  // Compras Externas actions
  addCompraExterna: (compra) => {
    const itensComMarkup = compra.itens.map(item => ({
      ...item,
      precoUnitObra: get().aplicarMarkup({
        obraId: undefined,
        categoria: item.produtoId ? get().produtos.find(p => p.id === item.produtoId)?.categoria : undefined,
        custoUnit: item.custoUnit
      })
    }));
    
    const newCompra = {
      ...compra,
      id: generateId(),
      itens: itensComMarkup
    };
    
    set((state) => ({ compras: [...state.compras, newCompra] }));
    get().saveToStorage();
  },
  
  updateCompraExterna: (id, compra) => {
    set((state) => ({
      compras: state.compras.map(c => c.id === id ? { ...c, ...compra } : c)
    }));
    get().saveToStorage();
  },
  
  deleteCompraExterna: (id) => {
    set((state) => ({
      compras: state.compras.filter(c => c.id !== id)
    }));
    get().saveToStorage();
  },
  
  vincularCompraAoTalao: (itemCompraId, itemTalId, qtd) => {
    set((state) => ({
      taloes: state.taloes.map(talao => ({
        ...talao,
        itens: talao.itens.map(item => 
          item.id === itemTalId
            ? {
                ...item,
                vinculosCompra: [
                  ...(item.vinculosCompra || []),
                  { itemCompraId, qtdVinculada: qtd }
                ]
              }
            : item
        )
      }))
    }));
    get().saveToStorage();
  },
  
  // Markup actions
  aplicarMarkup: ({ obraId, categoria, custoUnit }) => {
    const state = get();
    
    // Procurar regra por obra
    if (obraId) {
      const regraObra = state.regrasMarkup.find(r => r.alvo === 'obra' && r.ref === obraId);
      if (regraObra) {
        return custoUnit * (1 + regraObra.percentual);
      }
    }
    
    // Procurar regra por categoria
    if (categoria) {
      const regraCategoria = state.regrasMarkup.find(r => r.alvo === 'categoria' && r.ref === categoria);
      if (regraCategoria) {
        return custoUnit * (1 + regraCategoria.percentual);
      }
    }
    
    // Usar regra global
    const regraGlobal = state.regrasMarkup.find(r => r.alvo === 'global');
    const markup = regraGlobal?.percentual || state.config.markupGlobal;
    return custoUnit * (1 + markup);
  },
  
  addRegraMarkup: (regra) => {
    const newRegra = { ...regra, id: generateId() };
    set((state) => ({ regrasMarkup: [...state.regrasMarkup, newRegra] }));
    get().saveToStorage();
  },
  
  updateRegraMarkup: (id, regra) => {
    set((state) => ({
      regrasMarkup: state.regrasMarkup.map(r => r.id === id ? { ...r, ...regra } : r)
    }));
    get().saveToStorage();
  },
  
  deleteRegraMarkup: (id) => {
    set((state) => ({
      regrasMarkup: state.regrasMarkup.filter(r => r.id !== id)
    }));
    get().saveToStorage();
  },
  
  // Auth actions
  login: (email, password) => {
    const user = get().usuarios.find(u => u.email === email && u.ativo);
    if (user && password === 'admin123') {
      set({ currentUser: user });
      return true;
    }
    return false;
  },
  
  logout: () => set({ currentUser: null }),
  
  // Config actions
  updateConfig: (config) => {
    set((state) => ({ config: { ...state.config, ...config } }));
    get().saveToStorage();
  },
  
  // Backup/Restore actions
  exportData: () => {
    const state = get();
    const data = {
      obras: state.obras,
      produtos: state.produtos,
      fornecedores: state.fornecedores,
      taloes: state.taloes,
      compras: state.compras,
      devolucoes: state.devolucoes,
      regrasMarkup: state.regrasMarkup,
      ajustesEstoque: state.ajustesEstoque,
      config: state.config
    };
    return JSON.stringify(data, null, 2);
  },
  
  importData: (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      set((state) => ({
        ...state,
        ...data
      }));
      get().saveToStorage();
    } catch (error) {
      throw new Error('Dados inválidos para importação');
    }
  },
  
  // Persistence
  loadFromStorage: async () => {
    try {
      const data = await localforage.getItem('pls-obras-data');
      if (data) {
        set((state) => ({ ...state, ...(data as any) }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  },
  
  saveToStorage: async () => {
    try {
      const state = get();
      const dataToSave = {
        obras: state.obras,
        produtos: state.produtos,
        fornecedores: state.fornecedores,
        taloes: state.taloes,
        compras: state.compras,
        devolucoes: state.devolucoes,
        regrasMarkup: state.regrasMarkup,
        ajustesEstoque: state.ajustesEstoque,
        config: state.config
      };
      await localforage.setItem('pls-obras-data', dataToSave);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }
}));